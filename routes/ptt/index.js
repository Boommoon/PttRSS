const debug = require('debug')('rss:ptt:index');
const express = require('express');
const NodeCache = require('node-cache');
const Promise = require('bluebird');
const Feed = require('feed').Feed;
const { getArticlesFromLink, getArticleFromLink } = require('ptt');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 * 5, checkperiod: 0 });
const articleCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 0 });

function matchTitle(article, keywords) {
  for (let index = 0; index < keywords.length; index += 1) {
    if (article.title.toLowerCase().indexOf(keywords[index].toLowerCase()) !== -1) {
      debug('title: %s matched keyword: %s', article.title, keywords[index]);
      return true;
    }
  }

  debug('title: %s not matched any keywords: %s', article.title, keywords);
  return false;
}

function matchAuthor(article, keywords) {
  for (let index = 0; index < keywords.length; index += 1) {
    if (article.author[0].name.toLowerCase().indexOf(keywords[index].toLowerCase()) !== -1) {
      debug('author: %s matched keyword: %s', article.author, keywords[index]);
      return true;
    }
  }

  debug('author: %s not matched any keywords: %s', article.author, keywords);
  return false;
}

function filterArticles(articles, keywords, isauthor = false, exclude = false) {
  if (isauthor){
    return articles.filter(article => exclude ^ matchAuthor(article, keywords));
  }
  else {
    return articles.filter(article => exclude ^ matchTitle(article, keywords));
  }
}

function generateRSS(data, fetchContent) {
  fetchContent = (fetchContent === true);
  let { articles } = data;
  const feed = new Feed({
    title: data.board,
    description: `PTT: ${data.board}`,
    link: data.siteUrl,
    language: "zh-TW",
    generator: "PttRSS",
    feedLinks:{
      rss: `https://www.example.com/${data.board}.xml`
    }
  });
  const titleKeywords = data.titleKeywords;
  const exTitleKeywords = data.exTitleKeywords;
  const exAuthorKeywords = data.exAuthorKeywords;

  // filter by title keywords
  if (titleKeywords && titleKeywords.length > 0) {
    articles = filterArticles(articles, titleKeywords);
  }

  if (exTitleKeywords && exTitleKeywords.length > 0) {
    debug(exTitleKeywords);
    articles = filterArticles(articles, exTitleKeywords, false, true);
  }

  if (exAuthorKeywords && exAuthorKeywords.length > 0) {
    debug(exAuthorKeywords);
    articles = filterArticles(articles, exAuthorKeywords, true, true);
  }

  // filter by push counts
  articles = articles.filter(article => article.push > data.push);

  if (fetchContent === false) {
    return new Promise((resolve) => {
      articles.forEach((articleMeta) => {
        feed.addItem(articleMeta);
      });
      resolve(feed);
    });
  }

  return Promise.map(articles, (articleMeta) => {
    const article = articleCache.get(articleMeta.link);
    if (article) {
      debug('cached article: %s', article.title);
      feed.addItem(article);
      return;
    }

    getArticleFromLink(articleMeta.link)
      .then((_article) => {
        const articleWithMeta = Object.assign(articleMeta, _article);
        feed.addItem(articleWithMeta);
        debug('set cache article: %s', articleWithMeta.title, articleWithMeta.link);
        articleCache.set(articleWithMeta.link, articleWithMeta);
      })
      .delay(100);
  }, { concurrency: 3 }).then(() => Promise.resolve(feed));
}

router
  .get('/:board\.xml', (req, res, next) => {
    if (!req.params.board) return next(Error('Invaild Parameters'));

    const board = req.params.board.toLowerCase();
    const siteUrl = `https://www.ptt.cc/bbs/${board}/index.html`;
    const push = req.query.push || -99;
    const minArticleCount = req.query.minArticleCount || 50;
    const cachedKey = req.originalUrl;
    const fetchContent = req.query.fetchContent === 'true';
    let titleKeywords = req.query.title || [];
    if (!Array.isArray(titleKeywords)) {
      titleKeywords = [titleKeywords];
    }

    let exTitleKeywords = req.query.extitle || [];
    if (!Array.isArray(exTitleKeywords)) {
      exTitleKeywords = [exTitleKeywords];
    }

    let exAuthorKeywords = req.query.exauthor || [];
    if (!Array.isArray(exAuthorKeywords)) {
      exAuthorKeywords = [exAuthorKeywords];
    }

    // Get from cache first
    const obj = cache.get(cachedKey);
    if (obj) {
      return generateRSS({
        siteUrl,
        board,
        articles: obj.articles,
        titleKeywords,
        exTitleKeywords,
        exAuthorKeywords,
        push,
      }, fetchContent)
        .then((feed) => {
          debug('cached board: %s', board, cachedKey);
          res.set('Content-Type', 'text/xml');
          return res.send(feed.rss2());
        })
        .catch(err => next(err));
    }

    const response = function response(articles) {
      debug('set cache board: %s', board, cachedKey);
      cache.set(
        cachedKey,
        { articles },
      );

      return generateRSS({
        siteUrl,
        board,
        articles,
        titleKeywords,
        exTitleKeywords,
        exAuthorKeywords,
        push,
      }, fetchContent);
    };

    let articles = [];
    const getArticles = (data) => {
      if (!data.articles) throw Error('Fetch failed');

      articles = articles.concat(data.articles);
      if (articles.length < minArticleCount) {
        debug('get more articles, current count: %s', articles.length);
        return getArticlesFromLink(data.nextPageUrl)
          .then(_data => getArticles(_data));
      }

      return Promise.resolve(articles);
    };

    // Start crawling board index
    return getArticlesFromLink(siteUrl)
      .then(data => getArticles(data))
      .then(_articles => response(_articles))
      .then((feed) => {
        res.set('Content-Type', 'text/xml');
        res.send(feed.rss2());
      })
      .catch(err => next(err));
  });

module.exports = {
  router,
};
