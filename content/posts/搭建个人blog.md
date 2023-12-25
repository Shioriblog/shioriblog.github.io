---
title: "搭建个人blog"
date: 2023-12-23T12:27:38-05:00
draft: false
categories: [随便写写]
tags: [blog]
---

2022年6月开始重启写blog的事情，8月搬到美国之后，每个月都会写月总结，一开始在wordpress上写，花了很多钱，搞了自己的域名，但觉得wordpress太坑钱，之后就搬到notion上去，但notion也不是一个blog网站，所以也不是长久之计。因此一直打算自己建一个blog。前期摸索了半天并没有成功，还和象友[邓布利多教授](https://pensieve.wangxindi.org/)zoom视频了3小时，学习了一些经验，但依然没有成功。这次圣诞放假回家，想着闲着也是闲着，于是开始学习，居然成功建成了一个简单的个人blog！作为一个毫无编程知识的人来说，利用google+chatgpt3.5免费版，最终的学习结果还是很令我感动的！下面来记录一下。
<!--more-->
---

## 使用工具

1. [Hugo](https://gohugo.io/)
2. [Github](https://github.com/)
3. 电脑上的Terminal
4. [Sublime Text](https://www.sublimetext.com/)
5. [Yaml to Toml](https://transform.tools/yaml-to-toml) 转换网站
6. Google
7. ChatGPT 3.5版本

## 参考教程

[How to Create a Simple, Free Blog with Hugo and GitHub Pages](https://chrisjhart.com/Creating-A-Simple-Free-Blog-Hugo/)

## 最初建站的一些心得
1. 因为我没有用Github桌面版，全程推送都是靠Terminal，所以需要把我本地的blog文件和我自己的Github账户连上，方法是[邓布利多教授](https://pensieve.wangxindi.org/)告诉我的，现在我忘记怎么设定了，似乎是用gh。
2. 根据上述教程可以选择不同的theme，注意点是，有些theme的config文件是yaml，有些是toml，使用的code的格式不一样，hugo自动生成的blog的config是toml格式的，所以需要用[Yaml to Toml](https://transform.tools/yaml-to-toml) 转换网站来转换，或者在开始建hugo blog的时候就注明使用yaml，有一个code可以用，可以自行google或者问chatgpt。
3. 根据上面的教程得到的是一个非常简陋的blog，没有tag，没有category，没有about，archives，friends link page，RSS，上面的教程也没有教怎么给post里添加图片，这些图片应该放在哪个文件夹里等等，这些需要自己研究怎么做。

---

## 在Post里添加图片
1. 在 **static** folder里建一个文件夹叫 **images**
2. 把所有用到的图片都放在 **images** 这个文件夹中
3. 在post里插入图片的时候用markdown:

{{< code language="markdown" >}} 
![随便什么文字](/images/图片名称.图片格式)
{{< /code >}}

## 添加 About，Friends pages
1. 在 **content** 下面新建一个文件叫 **about.md**，可以使用以下code:

{{< code language="git" >}} 
$ hugo new about.md
{{< /code >}}

2. 这个About就是blog的about page，编辑好之后在blog上添加link
3. 我的模版是[Minos](https://github.com/carsonip/hugo-theme-minos)，添加的方式是在config里加入：

{{< code language="toml" >}} 
[[menu.main]]
  name = "About"
  url = "/about/"
  weight = 1
{{< /code >}}

4. 添加Friends page（友情链接）的方法一样。

## 添加 Archives page

添加归档page的方法也依据使用模板不同而不同（可能），我参考的[这个教程](https://huweim.github.io/post/blog_hugo_%E5%BD%92%E6%A1%A3%E9%A1%B5%E9%9D%A2%E5%88%B6%E4%BD%9C/)，但有几个步骤需要更改，所以我的方法如下：

1. 在**layouts** 文件夹下面，而非theme中的layouts下，添加 **_default** 文件夹，然后在terminal中利用以下code，添加一个**archives.html**文件

{{< code language="git" >}} 
$ touch layouts/_default/archives.html
{{< /code >}}

2. 在**content**下面新建一个文件叫**archives.md** 内容如下：

{{< code language="markdown" >}} 
---
title: "Archives"
layout: archives
hidden: true
date: 1900-12-21T22:14:14-05:00
url: /archives/
---
{{< /code >}}

3. 最后在config里添加archives page的link就可以。
4. 然而我的这个模板生成的archives page字体和样式都和难看，于是我添加了css更改了archives的字体，但似乎加入css之后会连blog名称和menu栏也改了。。。但起码修改成功了，更改方法可以直接问ChatGPT。

## 添加 RSS

1. 参考[这个教程](https://xuanwo.io/2018/04/08/hugo-rss-output-all-content/)成功生成了blog的rss
2. 但是如何加link花费了一番功夫，问ChatGPT也没有结果。
3. 后来google了半天最后研究出来RSS正确的url，于是在config里添加好link如下：

{{< code language="toml" >}} 
[[menu.main]]
  name = "RSS"
  url = "https://shioriblog.github.io/index.xml"
  weight = 5
{{< /code >}}

## 全部更新内容push到GitHub代码

根据上面的教程每次push到Github都很麻烦，后来ChatGTP告诉我可以用下面的简单的code：

{{< code language="git" >}} 
git add .
git commit -m "随便填什么"
git push origin main
{{< /code >}}

## 当下的一些问题

现在最基本的blog大致上是建好了，不过还有很多问题。比如，我想要更改H1，H2，H3等等的颜色，修改粗体字的颜色，link的颜色等等，这些都需要再慢慢研究。但有ChatGPT在手，就还是挺容易的。

## 使用ChatGPT的体验

我在使用chatgpt的时候就把它当一个人来问，遇到问题先问它，比如我需要在post里插入代码，就直接问它: I'm writing a hugo blog post and I need to insert some codes in my post. How? ChatGPT就会给我解决办法。问的越具体，给出的方法就越明确。如果按照它给的方法做不对，可以接着和它对话，比如说: no, it didn't work. 它会道歉，然后让你给出更明确的解释，哪里有问题等等，然后再更出别的解决方法。

然而，如果一个错误的变量太多，又没有办法用语言描述清楚，或者没有办法复制粘贴所有代码，chatgpt就不太能够给出解决方案，这时候我就依靠google。

所以用ChatGPT的体验就是，它可以是一个很好的助手，但我不能完全依赖它。