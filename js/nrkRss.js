 $(function () {


     /* Global variables */
     var $showCat,
         $ddMeny,
         $ddBtn,
         showRss;

     
     /* Get XML ajax function */
     function getXML(xmlUrl, callback) {
         $.ajax({
             method: "GET",
             url: xmlUrl,
             dataType: "xml",
             success: function (data) {
                 callback(data);
             },
             error: function (data) {
                 console.log("Error " + data);
             }
         });
     }

     
     /* Get Categories for dropdown buttons */
     function getCategories() {
         var callback = function (data) {
             /* Prepare for forEach, search Xml. */
             var $newsCat = $(data).find("newstype");
             $.each($newsCat, function (i, value) {

                 /* Prepare for append, search forEach result. */
                 var $newsType = $("type", value).text(),
                     $newsUrl = $("url", value).text();

                 /* Append newscategories to dropdown. Append OK, 'cus less data to handle. Cleaner setup */
                 $ddMeny.append(
                     $("<li>")
                     .html("<a href='#'>" + $newsType + "</a>")
                     .click(function () {
                         getRss($newsUrl);
                         $showCat.text(": " + $newsType);
                         $(this)
                             .addClass("active")
                             .siblings().removeClass("active")
                     })
                 ); /* append end*/
             }); /* foreach end*/
         };

         var xmlUrl = "xml/newsTypes.xml";
         /* Send to getXML function, with url and callback function*/
         getXML(xmlUrl, callback);
     }


     /* Get NRK RSS */
     function getRss(rssUrl) {
         var callback = function (data) {
             /* Prepare for forEach, search Xml */
             var $allNews = $(data).find("item");
             var htmlTxt = "";
             $.each($allNews, function (i, value) {

                 /* Prepare xml-elements for exist check */
                 var imgUrl = $("enclosure", value).attr("url");

                 /* Check if content has img url, else change with placeholder */
                 imgUrl = imgUrl || "img/placeholder.jpg";

                 /* Place XML-elements in object  */
                 var xmlObj = {
                     title: $("title", value).text(),
                     date: $("pubDate", value).text(),
                     imgUrl: imgUrl,
                     desc: $("description", value).text(),
                     link: $("link ", value).text(),
                     author: $("creator", value).text()
                 };

                 htmlTxt += buildArticle(xmlObj);

             }); /* forEach end */

             /*Write ajax to dom*/
             /*showRss.innerHTML = htmlTxt;*/
             var t0 = performance.now();
             showRss.innerHTML = htmlTxt;
             var t1 = performance.now();
             console.log("Call to set htmlTxt in DOM took " + (t1 - t0) + " milliseconds.");
         };

         var xmlUrl = "proxy.php?url=" + rssUrl;
         /* Send to getXML function, with url and callback function*/
         getXML(xmlUrl, callback);
     }


     /* Build articles */
     function buildArticle(xmlObj) {

         /* Concatenate strings, faster process when handeling big data */
         var articleCont = assembleHtml("img", "", xmlObj.imgUrl, xmlObj.title, "img-responsive article-img");
         articleCont += assembleHtml("h3", xmlObj.title, "aricle-title");
         articleCont += assembleHtml("p", xmlObj.author, "aricle-autor");
         articleCont += assembleHtml("p", xmlObj.date, "aricle-date");
         articleCont += assembleHtml("p", xmlObj.desc);

         var articleLink = assembleHtml("a", articleCont, xmlObj.link, "_blank");

         var article = assembleHtml("article", articleLink, "col-xs-12 col-sm-6 col-md-4 col-lg-3 clr-col");

         return article;
     }


     /* Assemble HTML-elements with jQuery. */
     function assembleHtml(elem, cont, attr, attr2, attr3) {
         var attributes = {};

         if (elem === "a") {
             attributes.href = attr;
             if (attr2) attributes.target = attr2;
         } else if (elem === "img") {
             attributes.src = attr;
             attributes.alt = attr2;
             if (attr3) attributes.class = attr3;
         } else {
             if (attr) attributes.class = attr;
         }

         /* Return jQuery object as string with outerHTML */
         return $("<" + elem + ">").attr(attributes).html(cont).prop('outerHTML');
     }

     
     /* Initialize code */
     var init = function () {
         var setObj = function () {
             $showCat = $("#showCat")
             $ddMeny = $("#ddMeny");
             $ddBtn = $("#ddBtn");
             showRss = document.getElementById("showRss");
         }();
         getCategories();
     }();

 });






 /*  
     Tried some tests with performance.now(). 
    
     Performance test on showRss-function.
     ".innerHTML = htmlTxt" shaves approx. 2-4ms on DOM writing.
     - Preferable to $showRss.html(htmlTxt); *\
     
     var t0 = performance.now();
     showRss.innerHTML = htmlTxt;
     var t1 = performance.now();
     console.log("Call to set htmlTxt in DOM took " + (t1 - t0) + " milliseconds.");
          
          
                 
     /* Performance test on JQ-asseble-function vs. JS-asseble-function: 
     Little preformance loss on assembleHtml(jQuery) when prefermancetest was done directly on assemble-functions,
     but assembleHtml(jQuery) gave better to same results when writing html to DOM in showRss-function. (hmmm)
     - assembleHtml(jQuery) is prefarable, with cleaner setup. *\

    /* Performance tests aganst the asseble-functions: *\
     $("#testBtn").click(function () {
         var t0 = performance.now();
         assembleHtml("img", "", "imgUrl", "alt", "class");
         assembleHtml("h3", "content", "class");
         var t1 = performance.now();
         console.log("JQ: Call to set htmlTxt in DOM took " + (t1 - t0) + " milliseconds.");

         var t2 = performance.now();
         assembleImg("img", "alt", "class");
         assembleElem("h3", "content", "class");
         var t3 = performance.now();
         console.log("JS: Call to set htmlTxt in DOM took " + (t3 - t2) + " milliseconds.");
     })
    
    
    /* The assemble functions with pure JS concatinating *\
    function buildArticle(xmlObj) {     
         var articleCont = assembleImg(xmlObj.imgUrl, xmlObj.title, "img-responsive article-img");
         articleCont += assembleElem("h3", xmlObj.title, "aricle-title");
         articleCont += assembleElem("p", xmlObj.author, "aricle-autor");
         articleCont += assembleElem("p", xmlObj.date, "aricle-date");
         articleCont += assembleElem("p", xmlObj.desc);

         var articleLink = assembleElem("a", articleCont, xmlObj.link);

         var article = assembleElem("article", articleLink, "col-xs-12 col-sm-6 col-md-4 col-lg-3 clr-col");

         return article;
     }
   
     var assembleElem = function (elem, cont, attr) {
         if (elem === "a") {
             return "<" + elem + " href='" + attr + "'>" + cont + "</" + elem + ">";
         } else if (attr) {
             return "<" + elem + " class='" + attr + "'>" + cont + "</" + elem + ">";
         } else {
             return "<" + elem + ">" + cont + "</" + elem + ">";
         }
     }

     var assembleImg = function (imgSrc, imgAlt, attr) {
         if (attr) {
             return "<img class='" + attr + "'src='" + imgSrc + "' alt='" + imgAlt + "'>";
         } else {
             return "<img src='" + imgSrc + "' alt='" + imgAlt + "'>";
         }

     } */