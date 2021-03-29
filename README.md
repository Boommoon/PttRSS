Ptt RSS
=======

Self-hosted Ptt RSS service

Please checkout how do I combine Ptt RSS with IFTTT push notification service to make life more easier. :joy:

[自造：PTT 新文章、關鍵字 手機通知服務](http://yulun.me/2015/ifttt-ptt-rss-alarm-event/)

Install
-------
```
git clone https://github.com/imZack/PttRSS
npm install
```


Usage
-----

### Start RSS Server

```
λ ~/ptt-to-rss/ PORT=8000 npm start
```

### Example

- Get RSS of drama-ticket

```sh
curl http://localhost:8000/drama-ticket.xml
```

Example output:
```xml
<rss version="2.0">
  <channel>
    <title>drama-ticket</title>
    <link>https://www.ptt.cc/bbs/drama-ticket/index.html</link>
    <description>PTT: drama-ticket</description>
    <lastBuildDate>Wed, 01 Jul 2015 16:12:40 GMT</lastBuildDate>
    <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
    <generator>PttRSS</generator>
    <language>zh-TW</language>
    <atom:link href="https://www.example.com/drama-ticket.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>[售票] 江蕙8/8 台北小巨蛋演唱會 黃3D$2800一張</title>
      <link>https://www.ptt.cc/bbs/Drama-Ticket/M.1435766811.A.8A7.html</link>
      <guid>https://www.ptt.cc/bbs/Drama-Ticket/M.1435766811.A.8A7.html</guid>
      <pubDate>Wed, 01 Jul 2015 16:06:51 GMT</pubDate>
      <author>pierrebebe.bbs@ptt.cc (pierrebebe)</author>
    </item>
    <item>
      <title>Re: [換票] 江蕙演唱會7/28紅1C連號換其他天</title>
      <link>https://www.ptt.cc/bbs/Drama-Ticket/M.1435767028.A.72C.html</link>
      <guid>https://www.ptt.cc/bbs/Drama-Ticket/M.1435767028.A.72C.html</guid>
      <pubDate>Wed, 01 Jul 2015 16:10:28 GMT</pubDate>
      <author>yinfan.bbs@ptt.cc (yinfan)</author>
    </item>
    <item>
      <title>[公告] 版規-發文前請務必看完</title>
      <link>https://www.ptt.cc/bbs/Drama-Ticket/M.1351960651.A.0B0.html</link>
      <guid>https://www.ptt.cc/bbs/Drama-Ticket/M.1351960651.A.0B0.html</guid>
      <pubDate>Sat, 3 Nov 2012 16:37:31 GMT</pubDate>
      <author>nickapple.bbs@ptt.cc (nickapple)</author>
    </item>
  </channel>
</rss>
```

- Match article title

```sh
// Single keyword
curl http://localhost:8000/Gossiping.xml?title=肥宅

// Multiple keywords (OR)
curl http://localhost:8000/Gossiping.xml?title=肥宅&title=國民黨

// Multiple exclude keywords
curl http://localhost:8000/Gossiping.xml?extitle=肥宅

// Push count filter
curl http://localhost:8000/Gossiping.xml?push=100 only get > 100 push
```

Example output:
```xml
<rss version="2.0">
  <channel>
    <title>
      Gossiping
    </title>
    <link>https://www.ptt.cc/bbs/Gossiping/index.html</link>
    <description>
      PTT: Gossiping
    </description>
    <lastBuildDate>Sun, 20 Dec 2015 06:17:04 GMT</lastBuildDate>
    <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
    <generator>PttRSS</generator>
    <language>zh-TW</language>
    <atom:link href="https://www.example.com/Gossiping.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>
        [問卦] 如果有「愛的號碼牌」肥宅會拿到幾號呢？
      </title>
      <link>https://www.ptt.cc/bbs/Gossiping/M.1450590925.A.F95.html</link>
      <guid>https://www.ptt.cc/bbs/Gossiping/M.1450590925.A.F95.html</guid>
      <pubDate>Sun, 20 Dec 2015 05:55:25 GMT</pubDate>
      <author>nobel777.bbs@ptt.cc (nobel777)</author>
    </item>
    <item>
      <title>
        [問卦] 有沒有這個肥宅網友到底想幹嘛的八卦？
      </title>
      <link>https://www.ptt.cc/bbs/Gossiping/M.1450590385.A.80F.html</link>
      <guid>https://www.ptt.cc/bbs/Gossiping/M.1450590385.A.80F.html</guid>
      <pubDate>Sun, 20 Dec 2015 05:46:25 GMT</pubDate>
      <author>poppylove.bbs@ptt.cc (poppylove)</author>
    </item>
    <item>
      <title>
        [問卦] 肥宅去參加系上舞會有搞頭嗎?
      </title>
      <link>https://www.ptt.cc/bbs/Gossiping/M.1450590531.A.491.html</link>
      <guid>https://www.ptt.cc/bbs/Gossiping/M.1450590531.A.491.html</guid>
      <pubDate>Sun, 20 Dec 2015 05:48:51 GMT</pubDate>
      <author>yuimoest.bbs@ptt.cc (yuimoest)</author>
    </item>
  </channel>
</rss>
```

Author
------
YuLun Shih

License
-------
[MIT](http://yulun.mit-license.org/)
