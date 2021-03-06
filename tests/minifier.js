/* global test, ok, equal */
(function(global) {
  'use strict';

  var minify = global.minify || require('../dist/htmlminifier.js').minify,
      input,
      output;

  test('parsing non-trivial markup', function() {
    equal(minify('<p title="</p>">x</p>'), '<p title="</p>">x</p>');
    equal(minify('<p title=" <!-- hello world --> ">x</p>'), '<p title=" <!-- hello world --> ">x</p>');
    equal(minify('<p title=" <![CDATA[ \n\n foobar baz ]]> ">x</p>'), '<p title=" <![CDATA[ \n\n foobar baz ]]> ">x</p>');
    equal(minify('<p foo-bar=baz>xxx</p>'), '<p foo-bar="baz">xxx</p>');
    equal(minify('<p foo:bar=baz>xxx</p>'), '<p foo:bar="baz">xxx</p>');

    input = '<div><div><div><div><div><div><div><div><div><div>' +
                  'i\'m 10 levels deep' +
                '</div></div></div></div></div></div></div></div></div></div>';

    equal(minify(input), input);

    equal(minify('<script>alert(\'<!--\')<\/script>'), '<script>alert(\'<!--\')<\/script>');
    equal(minify('<script>alert(\'<!-- foo -->\')<\/script>'), '<script>alert(\'<!-- foo -->\')<\/script>');
    equal(minify('<script>alert(\'-->\')<\/script>'), '<script>alert(\'-->\')<\/script>');

    equal(minify('<a title="x"href=" ">foo</a>'), '<a title="x" href="">foo</a>');
    equal(minify('<p id=""class=""title="">x'), '<p id="" class="" title="">x</p>');
    equal(minify('<p x="x\'"">x</p>'), '<p x="x\'">x</p>', 'trailing quote should be ignored');
    equal(minify('<a href="#"><p>Click me</p></a>'), '<a href="#"><p>Click me</p></a>');
    equal(minify('<span><button>Hit me</button></span>'), '<span><button>Hit me</button></span>');
    equal(minify('<object type="image/svg+xml" data="image.svg"><div>[fallback image]</div></object>'),
      '<object type="image/svg+xml" data="image.svg"><div>[fallback image]</div></object>'
    );

    equal(minify('<ng-include src="x"></ng-include>'), '<ng-include src="x"></ng-include>');
    equal(minify('<ng:include src="x"></ng:include>'), '<ng:include src="x"></ng:include>');
    equal(minify('<ng-include src="\'views/partial-notification.html\'"></ng-include><div ng-view=""></div>'),
      '<ng-include src="\'views/partial-notification.html\'"></ng-include><div ng-view=""></div>'
    );

    // https://github.com/kangax/html-minifier/issues/41
    equal(minify('<some-tag-1></some-tag-1><some-tag-2></some-tag-2>'),
      '<some-tag-1></some-tag-1><some-tag-2></some-tag-2>'
    );

    // https://github.com/kangax/html-minifier/issues/40
    equal(minify('[\']["]'), '[\']["]');

    // https://github.com/kangax/html-minifier/issues/21
    equal(minify('<a href="test.html"><div>hey</div></a>'), '<a href="test.html"><div>hey</div></a>');

    // https://github.com/kangax/html-minifier/issues/17
    equal(minify(':) <a href="http://example.com">link</a>'), ':) <a href="http://example.com">link</a>');
  });

  test('`minifiy` exists', function() {
    ok(minify);
  });

  test('options', function() {
    input = '<p>blah<span>blah 2<span>blah 3</span></span></p>';
    equal(minify(input), input);
    equal(minify(input, {}), input);
  });

  test('case normalization', function() {
    equal(minify('<P>foo</p>'), '<p>foo</p>');
    equal(minify('<DIV>boo</DIV>'), '<div>boo</div>');
    equal(minify('<DIV title="moo">boo</DiV>'), '<div title="moo">boo</div>');
    equal(minify('<DIV TITLE="blah">boo</DIV>'), '<div title="blah">boo</div>');
    equal(minify('<DIV tItLe="blah">boo</DIV>'), '<div title="blah">boo</div>');
    equal(minify('<DiV tItLe="blah">boo</DIV>'), '<div title="blah">boo</div>');
  });

  test('space normalization between attributes', function() {
    equal(minify('<p title="bar">foo</p>'), '<p title="bar">foo</p>');
    equal(minify('<img src="test"/>'), '<img src="test">');
    equal(minify('<p title = "bar">foo</p>'), '<p title="bar">foo</p>');
    equal(minify('<p title\n\n\t  =\n     "bar">foo</p>'), '<p title="bar">foo</p>');
    equal(minify('<img src="test" \n\t />'), '<img src="test">');
    equal(minify('<input title="bar"       id="boo"    value="hello world">'), '<input title="bar" id="boo" value="hello world">');
  });

  test('space normalization around text', function() {
    equal(minify('   <p>blah</p>\n\n\n   '), '<p>blah</p>');
    // tags from collapseWhitespaceSmart()
    ['a', 'b', 'big', 'button', 'code', 'em', 'font', 'i', 'kbd', 'mark', 'q', 's', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'time', 'tt', 'u'].forEach(function(el) {
      equal(minify('<p>foo <' + el + '>baz</' + el + '> bar</p>', { collapseWhitespace: true }), '<p>foo <' + el + '>baz</' + el + '> bar</p>');
      equal(minify('<p>foo<' + el + '>baz</' + el + '>bar</p>', { collapseWhitespace: true }), '<p>foo<' + el + '>baz</' + el + '>bar</p>');
      equal(minify('<p>foo <' + el + '>baz</' + el + '>bar</p>', { collapseWhitespace: true }), '<p>foo <' + el + '>baz</' + el + '>bar</p>');
      equal(minify('<p>foo<' + el + '>baz</' + el + '> bar</p>', { collapseWhitespace: true }), '<p>foo<' + el + '>baz</' + el + '> bar</p>');
      equal(minify('<p>foo <' + el + '> baz </' + el + '> bar</p>', { collapseWhitespace: true }), '<p>foo <' + el + '>baz</' + el + '> bar</p>');
      equal(minify('<p>foo<' + el + '> baz </' + el + '>bar</p>', { collapseWhitespace: true }), '<p>foo<' + el + '>baz</' + el + '>bar</p>');
      equal(minify('<p>foo <' + el + '> baz </' + el + '>bar</p>', { collapseWhitespace: true }), '<p>foo <' + el + '>baz</' + el + '>bar</p>');
      equal(minify('<p>foo<' + el + '> baz </' + el + '> bar</p>', { collapseWhitespace: true }), '<p>foo<' + el + '>baz</' + el + '> bar</p>');
    });
    equal(minify('<p>foo <img> bar</p>', { collapseWhitespace: true }), '<p>foo <img> bar</p>');
    equal(minify('<p>foo<img>bar</p>', { collapseWhitespace: true }), '<p>foo<img>bar</p>');
    equal(minify('<p>foo <img>bar</p>', { collapseWhitespace: true }), '<p>foo <img>bar</p>');
    equal(minify('<p>foo<img> bar</p>', { collapseWhitespace: true }), '<p>foo<img> bar</p>');
  });

  test('doctype normalization', function() {
    input = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"\n    "http://www.w3.org/TR/html4/strict.dtd">';
    equal(minify(input, { useShortDoctype: true }), '<!DOCTYPE html>');

    input = '<!DOCTYPE html>';
    equal(minify(input, { useShortDoctype: true }), input);

    input = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">';
    equal(minify(input, { useShortDoctype: false }), input);
  });

  test('removing comments', function() {
    input = '<!-- test -->';
    equal(minify(input, { removeComments: true }), '');

    input = '<!-- foo --><div>baz</div><!-- bar\n\n moo -->';
    equal(minify(input, { removeComments: true }), '<div>baz</div>');
    equal(minify(input, { removeComments: false }), input);

    input = '<p title="<!-- comment in attribute -->">foo</p>';
    equal(minify(input, { removeComments: true }), input);

    input = '<script><!-- alert(1) --><\/script>';
    equal(minify(input, { removeComments: true }), input);

    input = '<STYLE><!-- alert(1) --><\/STYLE>';
    equal(minify(input, { removeComments: true }), '<style><!-- alert(1) --><\/style>');
  });

  test('ignoring comments', function() {
    input = '<!--! test -->';
    equal(minify(input, { removeComments: true }), input);
    equal(minify(input, { removeComments: false }), input);

    input = '<!--! foo --><div>baz</div><!--! bar\n\n moo -->';
    equal(minify(input, { removeComments: true }), input);
    equal(minify(input, { removeComments: false }), input);

    input = '<!--! foo --><div>baz</div><!-- bar\n\n moo -->';
    equal(minify(input, { removeComments: true }), '<!--! foo --><div>baz</div>');
    equal(minify(input, { removeComments: false }), input);

    input = '<!-- ! test -->';
    equal(minify(input, { removeComments: true }), '');
    equal(minify(input, { removeComments: false }), input);

    input = '<div>\n\n   \t<div><div>\n\n<p>\n\n<!--!      \t\n\nbar\n\n moo         -->      \n\n</p>\n\n        </div>  </div></div>';
    output = '<div><div><div><p><!--!      \t\n\nbar\n\n moo         --></p></div></div></div>';
    equal(minify(input, { removeComments: true }), input);
    equal(minify(input, { removeComments: true, collapseWhitespace: true }), output);
    equal(minify(input, { removeComments: false }), input);
    equal(minify(input, { removeComments: false, collapseWhitespace: true }), output);

    input = '<p rel="<!-- comment in attribute -->" title="<!--! ignored comment in attribute -->">foo</p>';
    equal(minify(input, { removeComments: true }), input);
  });

  test('conditional comments', function() {
    input = '<!--[if IE 6]>test<![endif]-->';
    equal(minify(input, { removeComments: true }), input);

    input = '<!--[if lt IE 5.5]>test<![endif]-->';
    equal(minify(input, { removeComments: true }), input);

    input = '<!--[if (gt IE 5)&(lt IE 7)]>test<![endif]-->';
    equal(minify(input, { removeComments: true }), input);
  });

  test('collapsing space in conditional comments', function() {
    input = '<!--[if IE 7]>\n\n   \t\n   \t\t ' +
              '<link rel="stylesheet" href="/css/ie7-fixes.css" type="text/css" />\n\t' +
            '<![endif]-->';
    output = '<!--[if IE 7]>' +
                '<link rel="stylesheet" href="/css/ie7-fixes.css" type="text/css" />' +
             '<![endif]-->';
    equal(minify(input, { removeComments: true }), output);

    input = '<!--[if lte IE 6]>\n    \n   \n\n\n\t' +
              '<p title=" sigificant     whitespace   ">blah blah</p>' +
            '<![endif]-->';
    output = '<!--[if lte IE 6]>' +
              '<p title=" sigificant     whitespace   ">blah blah</p>' +
            '<![endif]-->';
    equal(minify(input, { removeComments: true }), output);
  });

  test('remove comments from scripts', function() {
    input = '<script><!--alert(1)--><\/script>';
    output = '<script><\/script>';
    equal(minify(input, { removeCommentsFromCDATA: true }), output);

    input = '<script><!--alert(1)<\/script>';
    output = '<script><\/script>';
    equal(minify(input, { removeCommentsFromCDATA: true }), output);

    input = '<script type="text/javascript"> <!--\nalert("-->"); -->\n\n   <\/script>';
    output = '<script type="text/javascript">alert("-->");<\/script>';
    equal(minify(input, { removeCommentsFromCDATA: true }), output);

    input = '<script> //   <!--   \n  alert(1)   //  --> <\/script>';
    output = '<script>  alert(1)<\/script>';
    equal(minify(input, { removeCommentsFromCDATA: true }), output);
  });

  test('remove comments from styles', function() {
    input = '<style type="text/css"><!-- p { color: red } --><\/style>';
    output = '<style type="text/css">p { color: red }<\/style>';
    equal(minify(input, { removeCommentsFromCDATA: true }), output);

    input = '<style type="text/css">p::before { content: "<!--" }<\/style>';
    equal(minify(input, { removeCommentsFromCDATA: true }), input);
  });

  test('remove CDATA sections from scripts/styles', function() {
    input = '<script>/*<![CDATA[*/alert(1)/*]]>*/<\/script>';
    output = '<script>alert(1)<\/script>';
    equal(minify(input, { removeCDATASectionsFromCDATA: true }), output);

    input = '<script>//<![CDATA[\nalert(1)\n//]]><\/script>';
    output = '<script>\nalert(1)\n<\/script>';
    equal(minify(input, { removeCDATASectionsFromCDATA: true }), output);

    input = '<script type="text/javascript"> /* \n\t  <![CDATA[  */ alert(1) /*  ]]>  */ \n <\/script>';
    output = '<script type="text/javascript"> alert(1) <\/script>';
    equal(minify(input, { removeCDATASectionsFromCDATA: true }), output);

    input = '<style>/* <![CDATA[ */p { color: red } // ]]><\/style>';
    output = '<style>p { color: red } <\/style>';
    equal(minify(input, { removeCDATASectionsFromCDATA: true }), output);

    input = '<script>\n\n//<![CDATA[\nalert(1)//]]><\/script>';
    output = '<script>\nalert(1)<\/script>';
    equal(minify(input, { removeCDATASectionsFromCDATA: true }), output);

  });

  test('empty attributes', function() {
    input = '<p id="" class="" STYLE=" " title="\n" lang="" dir="">x</p>';
    equal(minify(input, { removeEmptyAttributes: true }), '<p>x</p>');

    input = '<p onclick=""   ondblclick=" " onmousedown="" ONMOUSEUP="" onmouseover=" " onmousemove="" onmouseout="" ' +
            'onkeypress=\n\n  "\n     " onkeydown=\n"" onkeyup\n="">x</p>';
    equal(minify(input, { removeEmptyAttributes: true }), '<p>x</p>');

    input = '<input onfocus="" onblur="" onchange=" " value=" boo ">';
    equal(minify(input, { removeEmptyAttributes: true }), '<input value=" boo ">');

    input = '<input value="" name="foo">';
    equal(minify(input, { removeEmptyAttributes: true }), '<input name="foo">');

    input = '<img src="" alt="">';
    equal(minify(input, { removeEmptyAttributes: true }), '<img src="" alt="">');
  });

  test('cleaning class/style attributes', function() {
    input = '<p class=" foo bar  ">foo bar baz</p>', output;
    equal(minify(input, { cleanAttributes: true }), '<p class="foo bar">foo bar baz</p>');

    input = '<p class=" foo      ">foo bar baz</p>';
    equal(minify(input, { cleanAttributes: true }), '<p class="foo">foo bar baz</p>');
    equal(minify(input, { cleanAttributes: true, removeAttributeQuotes: true }), '<p class=foo>foo bar baz</p>');

    input = '<p class="\n  \n foo   \n\n\t  \t\n   ">foo bar baz</p>';
    output = '<p class="foo">foo bar baz</p>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<p class="\n  \n foo   \n\n\t  \t\n  class1 class-23 ">foo bar baz</p>';
    output = '<p class="foo class1 class-23">foo bar baz</p>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<p style="    color: red; background-color: rgb(100, 75, 200);  "></p>';
    output = '<p style="color: red; background-color: rgb(100, 75, 200)"></p>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<p style="font-weight: bold  ; "></p>';
    output = '<p style="font-weight: bold"></p>';
    equal(minify(input, { cleanAttributes: true }), output);
  });

  test('cleaning URI-based attributes', function() {
    input = '<a href="   http://example.com  ">x</a>';
    output = '<a href="http://example.com">x</a>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<a href="  \t\t  \n \t  ">x</a>';
    output = '<a href="">x</a>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<img src="   http://example.com  " title="bleh   " longdesc="  http://example.com/longdesc \n\n   \t ">';
    output = '<img src="http://example.com" title="bleh   " longdesc="http://example.com/longdesc">';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<img src="" usemap="   http://example.com  ">';
    output = '<img src="" usemap="http://example.com">';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<form action="  somePath/someSubPath/someAction?foo=bar&baz=qux     "></form>';
    output = '<form action="somePath/someSubPath/someAction?foo=bar&baz=qux"></form>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<BLOCKQUOTE cite=" \n\n\n http://www.mycom.com/tolkien/twotowers.html     "><P>foobar</P></BLOCKQUOTE>';
    output = '<blockquote cite="http://www.mycom.com/tolkien/twotowers.html"><p>foobar</p></blockquote>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<head profile="       http://gmpg.org/xfn/11    "></head>';
    output = '<head profile="http://gmpg.org/xfn/11"></head>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<object codebase="   http://example.com  "></object>';
    output = '<object codebase="http://example.com"></object>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<span profile="   1, 2, 3  ">foo</span>';
    equal(minify(input, { cleanAttributes: true }), input);

    input = '<div action="  foo-bar-baz ">blah</div>';
    equal(minify(input, { cleanAttributes: true }), input);
  });

  test('cleaning Number-based attributes', function() {
    input = '<a href="#" tabindex="   1  ">x</a><button tabindex="   2  ">y</button>';
    output = '<a href="#" tabindex="1">x</a><button tabindex="2">y</button>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<input value="" maxlength="     5 ">';
    output = '<input value="" maxlength="5">';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<select size="  10   \t\t "><option>x</option></select>';
    output = '<select size="10"><option>x</option></select>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<textarea rows="   20  " cols="  30      "></textarea>';
    output = '<textarea rows="20" cols="30"></textarea>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<COLGROUP span="   40  "><COL span="  39 "></COLGROUP>';
    output = '<colgroup span="40"><col span="39"></colgroup>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<tr><td colspan="    2   ">x</td><td rowspan="   3 "></td></tr>';
    output = '<tr><td colspan="2">x</td><td rowspan="3"></td></tr>';
    equal(minify(input, { cleanAttributes: true }), output);
  });

  test('cleaning other attributes', function() {
    input = '<a href="#" onclick="  window.prompt(\'boo\'); " onmouseover=" \n\n alert(123)  \t \n\t  ">blah</a>';
    output = '<a href="#" onclick="window.prompt(\'boo\')" onmouseover="alert(123)">blah</a>';
    equal(minify(input, { cleanAttributes: true }), output);

    input = '<body onload="  foo();   bar() ;  "><p>x</body>';
    output = '<body onload="foo();   bar()"><p>x</p></body>';
    equal(minify(input, { cleanAttributes: true }), output);
  });

  test('removing redundant attributes (&lt;form method="get" ...>)', function() {
    input = '<form method="get">hello world</form>';
    equal(minify(input, { removeRedundantAttributes: true }), '<form>hello world</form>');

    input = '<form method="post">hello world</form>';
    equal(minify(input, { removeRedundantAttributes: true }), '<form method="post">hello world</form>');
  });

  test('removing redundant attributes (&lt;input type="text" ...>)', function() {
    input = '<input type="text">';
    equal(minify(input, { removeRedundantAttributes: true }), '<input>');

    input = '<input type="  TEXT  " value="foo">';
    equal(minify(input, { removeRedundantAttributes: true }), '<input value="foo">');

    input = '<input type="checkbox">';
    equal(minify(input, { removeRedundantAttributes: true }), '<input type="checkbox">');
  });

  test('removing redundant attributes (&lt;a name="..." id="..." ...>)', function() {
    input = '<a id="foo" name="foo">blah</a>';
    equal(minify(input, { removeRedundantAttributes: true }), '<a id="foo">blah</a>');

    input = '<input id="foo" name="foo">';
    equal(minify(input, { removeRedundantAttributes: true }), input);

    input = '<a name="foo">blah</a>';
    equal(minify(input, { removeRedundantAttributes: true }), input);

    input = '<a href="..." name="  bar  " id="bar" >blah</a>';
    equal(minify(input, { removeRedundantAttributes: true }), '<a href="..." id="bar">blah</a>');
  });

  test('removing redundant attributes (&lt;script src="..." charset="...">)', function() {
    input = '<script type="text/javascript" charset="UTF-8">alert(222);<\/script>';
    output = '<script type="text/javascript">alert(222);<\/script>';
    equal(minify(input, { removeRedundantAttributes: true }), output);

    input = '<script type="text/javascript" src="http://example.com" charset="UTF-8">alert(222);<\/script>';
    equal(minify(input, { removeRedundantAttributes: true }), input);

    input = '<script CHARSET=" ... ">alert(222);<\/script>';
    output = '<script>alert(222);<\/script>';
    equal(minify(input, { removeRedundantAttributes: true }), output);
  });

  test('removing redundant attributes (&lt;... language="javascript" ...>)', function() {
    input = '<script language="Javascript">x=2,y=4<\/script>';
    equal(minify(input, { removeRedundantAttributes: true }), '<script>x=2,y=4<\/script>');

    input = '<script LANGUAGE = "  javaScript  ">x=2,y=4<\/script>';
    equal(minify(input, { removeRedundantAttributes: true }), '<script>x=2,y=4<\/script>');
  });

  test('removing redundant attributes (&lt;area shape="rect" ...>)', function() {
    input = '<area shape="rect" coords="696,25,958,47" href="#" title="foo">';
    output = '<area coords="696,25,958,47" href="#" title="foo">';
    equal(minify(input, { removeRedundantAttributes: true }), output);
  });

  test('removing redundant attributes (&lt;... = "javascript: ..." ...>)', function() {
    input = '<p onclick="javascript:alert(1)">x</p>';
    equal(minify(input, { cleanAttributes: true }), '<p onclick="alert(1)">x</p>');

    input = '<p onclick="javascript:x">x</p>';
    equal(minify(input, { cleanAttributes: true, removeAttributeQuotes: true }), '<p onclick=x>x</p>');

    input = '<p onclick=" JavaScript: x">x</p>';
    equal(minify(input, { cleanAttributes: true }), '<p onclick="x">x</p>');

    input = '<p title="javascript:(function() { /* some stuff here */ })()">x</p>';
    equal(minify(input, { cleanAttributes: true }), input);
  });

  test('removing type="text/javascript" attributes', function() {
    input = '<script type="text/javascript">alert(1)<\/script>';
    output = '<script>alert(1)<\/script>';

    equal(minify(input, { removeScriptTypeAttributes: true }), output);
    equal(minify(input, { removeScriptTypeAttributes: false }), input);

    input = '<SCRIPT TYPE="  text/javascript ">alert(1)<\/script>';
    output = '<script>alert(1)<\/script>';

    equal(minify(input, { removeScriptTypeAttributes: true }), output);

    input = '<script type="application/javascript;version=1.8">alert(1)<\/script>';
    output = '<script type="application/javascript;version=1.8">alert(1)<\/script>';

    equal(minify(input, { removeScriptTypeAttributes: true }), output);

    input = '<script type="text/vbscript">MsgBox("foo bar")<\/script>';
    output = '<script type="text/vbscript">MsgBox("foo bar")<\/script>';

    equal(minify(input, { removeScriptTypeAttributes: true }), output);
  });

  test('removing type="text/css" attributes', function() {
    input = '<style type="text/css">.foo { color: red }<\/style>';
    output = '<style>.foo { color: red }<\/style>';

    equal(minify(input, { removeStyleLinkTypeAttributes: true }), output);
    equal(minify(input, { removeStyleLinkTypeAttributes: false }), input);

    input = '<STYLE TYPE = "  text/CSS ">body { font-size: 1.75em }<\/style>';
    output = '<style>body { font-size: 1.75em }<\/style>';

    equal(minify(input, { removeStyleLinkTypeAttributes: true }), output);

    input = '<style type="text/plain">.foo { background: green }<\/style>';
    output = '<style type="text/plain">.foo { background: green }<\/style>';

    equal(minify(input, { removeStyleLinkTypeAttributes: true }), output);

    input = '<link rel="stylesheet" type="text/css" href="http://example.com">';
    output = '<link rel="stylesheet" href="http://example.com">';

    equal(minify(input, { removeStyleLinkTypeAttributes: true }), output);

    input = '<link rel="alternate" type="application/atom+xml" href="data.xml">';

    equal(minify(input, { removeStyleLinkTypeAttributes: true }), input);
  });

  test('removing attribute quotes', function() {
    input = '<p title="blah" class="a23B-foo.bar_baz:qux" id="moo">foo</p>';
    equal(minify(input, { removeAttributeQuotes: true }), '<p title=blah class=a23B-foo.bar_baz:qux id=moo>foo</p>');

    input = '<input value="hello world">';
    equal(minify(input, { removeAttributeQuotes: true }), '<input value="hello world">');

    input = '<a href="#" title="foo#bar">x</a>';
    equal(minify(input, { removeAttributeQuotes: true }), '<a href=# title=foo#bar>x</a>');

    input = '<a href="http://example.com/" title="blah">\nfoo\n\n</a>';
    equal(minify(input, { removeAttributeQuotes: true }), '<a href="http://example.com/" title=blah>\nfoo\n\n</a>');

    input = '<a title="blah" href="http://example.com/">\nfoo\n\n</a>';
    equal(minify(input, { removeAttributeQuotes: true }), '<a title=blah href="http://example.com/">\nfoo\n\n</a>');

    input = '<p class=foo|bar:baz></p>';
    equal(minify(input, { removeAttributeQuotes: true }), '<p class=foo|bar:baz></p>');
  });

  test('collapsing whitespace', function() {
    input = '<script type="text/javascript">  \n\t   alert(1) \n\n\n  \t <\/script>';
    output = '<script type="text/javascript">alert(1)<\/script>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<p>foo</p>    <p> bar</p>\n\n   \n\t\t  <div title="quz">baz  </div>';
    output = '<p>foo</p><p>bar</p><div title="quz">baz</div>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<p> foo    bar</p>';
    output = '<p>foo bar</p>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<p>foo\nbar</p>';
    output = '<p>foo bar</p>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<p> foo    <span>  blah     <i>   22</i>    </span> bar <img src=""></p>';
    output = '<p>foo <span>blah <i>22</i></span> bar <img src=""></p>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<textarea> foo bar     baz \n\n   x \t    y </textarea>';
    output = '<textarea> foo bar     baz \n\n   x \t    y </textarea>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<div><textarea></textarea>    </div>';
    output = '<div><textarea></textarea></div>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<div><pre> $foo = "baz"; </pre>    </div>';
    output = '<div><pre> $foo = "baz"; </pre></div>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<script type=\"text\/javascript\">var = \"hello\";<\/script>\r\n\r\n\r\n'               +
             '<style type=\"text\/css\">#foo { color: red;        }          <\/style>\r\n\r\n\r\n'  +
             '<div>\r\n  <div>\r\n    <div><!-- hello -->\r\n      <div>'                            +
             '<!--! hello -->\r\n        <div>\r\n          <div class=\"\">\r\n\r\n            '    +
             '<textarea disabled=\"disabled\">     this is a textarea <\/textarea>\r\n          '    +
             '<\/div>\r\n        <\/div>\r\n      <\/div>\r\n    <\/div>\r\n  <\/div>\r\n<\/div>'    +
             '<pre>       \r\nxxxx<\/pre><span>x<\/span> <span>Hello<\/span> <b>billy<\/b>     \r\n' +
             '<input type=\"text\">\r\n<textarea><\/textarea>\r\n<pre><\/pre>';
    output = '<script type="text/javascript">var = "hello";</script>'                                +
             '<style type="text/css">#foo { color: red;        }</style>'                            +
             '<div><div><div>'                                                                       +
             '<!-- hello --><div><!--! hello --><div><div class="">'                                 +
             '<textarea disabled="disabled">     this is a textarea </textarea>'                     +
             '</div></div></div></div></div></div>'                                                  +
             '<pre>       \r\nxxxx</pre><span>x</span> <span>Hello</span> <b>billy</b> '             +
             '<input type="text"><textarea></textarea><pre></pre>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<pre title="some title...">   hello     world </pre>';
    output = '<pre title="some title...">   hello     world </pre>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<pre title="some title..."><code>   hello     world </code></pre>';
    output = '<pre title="some title..."><code>   hello     world </code></pre>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<script>alert("foo     bar")    <\/script>';
    output = '<script>alert("foo     bar")<\/script>';
    equal(minify(input, { collapseWhitespace: true }), output);

    input = '<style>alert("foo     bar")    <\/style>';
    output = '<style>alert("foo     bar")<\/style>';
    equal(minify(input, { collapseWhitespace: true }), output);
  });

  test('removing empty elements', function() {

    equal(minify('<p>x</p>', { removeEmptyElements: true }), '<p>x</p>');
    equal(minify('<p></p>', { removeEmptyElements: true }), '');

    input = '<p>foo<span>bar</span><span></span></p>';
    output = '<p>foo<span>bar</span></p>';
    equal(minify(input, { removeEmptyElements: true }), output);

    input = '<a href="http://example/com" title="hello world"></a>';
    output = '';
    equal(minify(input, { removeEmptyElements: true }), output);

    input = '<textarea cols="10" rows="10"></textarea>';
    output = '<textarea cols="10" rows="10"></textarea>';
    equal(minify(input, { removeEmptyElements: true }), output);

    input = '<div>hello<span>world</span></div>';
    output = '<div>hello<span>world</span></div>';
    equal(minify(input, { removeEmptyElements: true }), output);

    input = '<p>x<span title="<" class="blah-moo"></span></p>';
    output = '<p>x</p>';
    equal(minify(input, { removeEmptyElements: true }), output);

    input = '<div>x<div>y <div>blah</div><div></div>foo</div>z</div>';
    output = '<div>x<div>y <div>blah</div>foo</div>z</div>';
    equal(minify(input, { removeEmptyElements: true }), output);

    input = '<img src="">';
    equal(minify(input, { removeEmptyElements: true }), input);

    input = '<p><!-- x --></p>';
    output = '';
    equal(minify(input, { removeEmptyElements: true }), output);
  });

  test('collapsing boolean attributes', function() {
    input = '<input disabled="disabled">';
    equal(minify(input, { collapseBooleanAttributes: true }), '<input disabled>');

    input = '<input CHECKED = "checked" readonly="readonly">';
    equal(minify(input, { collapseBooleanAttributes: true }), '<input checked readonly>');

    input = '<option name="blah" selected="selected">moo</option>';
    equal(minify(input, { collapseBooleanAttributes: true }), '<option name="blah" selected>moo</option>');

    input = '<input autofocus="autofocus">';
    equal(minify(input, { collapseBooleanAttributes: true }), '<input autofocus>');

    input = '<input required="required">';
    equal(minify(input, { collapseBooleanAttributes: true }), '<input required>');

    input = '<input multiple="multiple">';
    equal(minify(input, { collapseBooleanAttributes: true }), '<input multiple>');
  });

  test('keeping trailing slashes in tags', function() {
    equal(minify('<img src="test"/>', { keepClosingSlash: true }), '<img src="test"/>');
  });

  test('removing optional tags', function() {
    input = '<html><head><title>hello</title></head><body><p>foo<span>bar</span></p></body></html>';
    output = '<html><head><title>hello</title><body><p>foo<span>bar</span></p>';
    equal(minify(input, { removeOptionalTags: true }), output);
    equal(minify(input), input);
  });

  test('removing optional tags in tables', function() {

    input = '<table>' +
              '<thead><tr><th>foo</th><th>bar</th></tr></thead>' +
              '<tfoot><tr><th>baz</th><th>qux</th></tr></tfoot>' +
              '<tbody><tr><td>boo</td><td>moo</td></tr></tbody>' +
            '</table>';

    output = '<table>' +
              '<thead><tr><th>foo<th>bar' +
              '<tfoot><tr><th>baz<th>qux' +
              '<tbody><tr><td>boo<td>moo' +
             '</table>';

    equal(minify(input, { removeOptionalTags: true }), output);
    equal(minify(input), input);
  });

  test('removing optional tags in options', function() {
    input = '<select><option>foo</option><option>bar</option></select>';
    output = '<select><option>foo<option>bar</select>';
    equal(minify(input, { removeOptionalTags: true }), output);

    // example from htmldog.com
    input = '<select name="catsndogs">' +
              '<optgroup label="Cats">' +
                '<option>Tiger</option><option>Leopard</option><option>Lynx</option>' +
              '</optgroup>' +
              '<optgroup label="Dogs">' +
                '<option>Grey Wolf</option><option>Red Fox</option><option>Fennec</option>' +
              '</optgroup>' +
            '</select>';

    output = '<select name="catsndogs">' +
              '<optgroup label="Cats">' +
                '<option>Tiger<option>Leopard<option>Lynx' +
              '</optgroup>' +
              '<optgroup label="Dogs">' +
                '<option>Grey Wolf<option>Red Fox<option>Fennec' +
              '</optgroup>' +
            '</select>';

    equal(minify(input, { removeOptionalTags: true }), output);
  });

  test('custom components', function() {
    input = '<custom-component>Oh, my.</custom-component>';
    output = '<custom-component>Oh, my.</custom-component>';

    equal(minify(input), output);
  });

  test('HTML4: anchor with block elements', function() {
    input = '<a href="#"><div>Well, look at me! I\'m a div!</div></a>';
    output = '<a href="#"></a><div>Well, look at me! I\'m a div!</div>';

    equal(minify(input, { html5: false }), output);
  });

  test('HTML5: anchor with block elements', function() {
    input = '<a href="#"><div>Well, look at me! I\'m a div!</div></a>';
    output = '<a href="#"><div>Well, look at me! I\'m a div!</div></a>';

    equal(minify(input, { html5: true }), output);
  });

  test('HTML5: enabled by default', function() {
    input = '<a href="#"><div>Well, look at me! I\'m a div!</div></a>';

    equal(minify(input, { html5: true }), minify(input));
  });

  // https://github.com/kangax/html-minifier/issues/10
  test('Ignored tags: enabled by default', function() {

    input = 'This is the start. <% ... %>\r\n<%= ... %>\r\n<? ... ?>\r\n<!-- This is the middle, and a comment. -->\r\nNo comment, but middle.\r\n<?= ... ?>\r\n<?php ... ?>\r\n<?xml ... ?>\r\nHello, this is the end!';
    output = 'This is the start.<% ... %><%= ... %><? ... ?>No comment, but middle.<?= ... ?><?php ... ?><?xml ... ?>Hello, this is the end!';
    equal(minify(input, {}), input);
    equal(minify(input, { removeComments: true, collapseWhitespace: true }), output);
    output = 'This is the start.No comment, but middle.Hello, this is the end!';
    equal(minify(input, { removeComments: true, collapseWhitespace: true, removeIgnored: true }), output);

    input = '<% if foo? %>\r\n  <div class="bar">\r\n    ...\r\n  </div>\r\n<% end %>';
    output = '<% if foo? %><div class="bar">...</div><% end %>';
    equal(minify(input, {}), input);
    equal(minify(input, { collapseWhitespace: true }), output);
    output = '<div class="bar">...</div>';
    equal(minify(input, { collapseWhitespace: true, removeIgnored: true }), output);

  });

  test('bootstrap\'s span > button > span', function() {
    input = '<span class="input-group-btn">' +
      '\n  <button class="btn btn-default" type="button">' +
        '\n    <span class="glyphicon glyphicon-search"></span>' +
      '\n  </button>' +
    '</span>';

    output = '<span class=input-group-btn><button class="btn btn-default" type=button><span class="glyphicon glyphicon-search"></span></button></span>';

    equal(minify(input, { collapseWhitespace: true, removeAttributeQuotes: true }), output);
  });

  test('caseSensitive', function() {
    input = '<svg class="icon icon-activity-by-tag" xmlns="http://www.w3.org/2000/svg" width="100px" height="100px" viewBox="0 0 100 100"></svg>';

    var caseSensitiveOutput = '<svg class="icon icon-activity-by-tag" xmlns="http://www.w3.org/2000/svg" width="100px" height="100px" viewBox="0 0 100 100"></svg>';
    var caseInSensitiveOutput = '<svg class="icon icon-activity-by-tag" xmlns="http://www.w3.org/2000/svg" width="100px" height="100px" viewbox="0 0 100 100"></svg>';

    equal(minify(input), caseInSensitiveOutput);
    equal(minify(input, { caseSensitive: true }), caseSensitiveOutput);
  });

  test('source', function() {

    input = '<audio controls="controls">' +
              '<source src="foo.wav">' +
              '<source src="far.wav">' +
              '<source src="foobar.wav">' +
            '</audio>';
    output = '<audio controls="controls">' +
              '<source src="foo.wav">' +
              '<source src="far.wav">' +
              '<source src="foobar.wav">' +
            '</audio>';

    equal(minify(input, { removeOptionalTags: true }), output);
  });

  test('nested quotes', function() {
    input = '<p ng-class=\'"test"\'></p>';
    output = '<p ng-class="&quot;test&quot;"></p>';
    equal(minify(input), output);
  });

  test('script minification', function() {
    input = '<script>(function(){ var foo = 1; var bar = 2; alert(foo + " " + bar); })()</script>';
    output = '<script>!function(){var a=1,n=2;alert(a+" "+n)}();</script>';

    equal(minify(input, { minifyJS: true }), output);

    input = "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-67NT');</script>";
    output = '<script>!function(w,d,s,l,i){w[l]=w[l]||[],w[l].push({"gtm.start":(new Date).getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl="dataLayer"!=l?"&l="+l:"";j.async=!0,j.src="//www.googletagmanager.com/gtm.js?id="+i+dl,f.parentNode.insertBefore(j,f)}(window,document,"script","dataLayer","GTM-67NT");</script>';

    equal(minify(input, { minifyJS: { mangle: false } }), output);

    // input = '<script>' +
    //         '  <!--' +
    //         '    Platform.Mobile.Bootstrap.init(function () {' +
    //         '      Platform.Mobile.Core.Navigation.go("Login", {' +
    //         '        "error": ""' +
    //         '      });' +
    //         '    });' +
    //         '  //-->' +
    //         '</script>';

    // output = '<script>Platform.Mobile.Bootstrap.init(function(){Platform.Mobile.Core.Navigation.go("Login",{error:""})});</script>';

    // equal(minify(input, {
    //   removeCommentsFromCDATA: true,
    //   minifyJS: true
    // }), output);
  });

  test('on* minification', function() {
    input = '<div onclick="alert(a + b)"></div>';
    output = '<div onclick="alert(a+b)"></div>';

    equal(minify(input, { minifyJS: true }), output);

    input = '<a href="/" onclick="this.href = getUpdatedURL (this.href);return true;">test</a>';
    output = '<a href="/" onclick="return this.href=getUpdatedURL(this.href),!0">test</a>';

    equal(minify(input, { minifyJS: true }), output);

    input = "<a onclick=\"try{ dcsMultiTrack('DCS.dcsuri','USPS','WT.ti') }catch(e){}\"> foobar</a>";
    output = "<a onclick=\"try{dcsMultiTrack(&quot;DCS.dcsuri&quot;,&quot;USPS&quot;,&quot;WT.ti&quot;)}catch(e){}\"> foobar</a>";

    equal(minify(input, { minifyJS: { mangle: false } }), output);

    input = '<a onClick="_gaq.push([\'_trackEvent\', \'FGF\', \'banner_click\']);"></a>';
    output = '<a onclick="_gaq.push([&quot;_trackEvent&quot;,&quot;FGF&quot;,&quot;banner_click&quot;])"></a>';

    equal(minify(input, { minifyJS: true }), output);

    input = '<button type="button" onclick=";return false;" id="appbar-guide-button"></button>';
    output = '<button type="button" onclick="return!1" id="appbar-guide-button"></button>';

    equal(minify(input, { minifyJS: true }), output);
  });

  test('escaping closing script tag', function() {
    var input = '<script>window.jQuery || document.write(\'<script src="jquery.js"><\\/script>\')</script>';
    var output = '<script>window.jQuery||document.write(\'<script src="jquery.js"><\\/script>\');</script>';

    equal(minify(input, { minifyJS: true }), output);
  });

  test('style minification', function() {
    input = '<style>div#foo { background-color: red; color: white }</style>';
    output = '<style>div#foo{background-color:red;color:#fff}</style>';

    equal(minify(input), input);
    equal(minify(input, { minifyCSS: true }), output);

    input = '<style>div > p.foo + span { border: 10px solid black }</style>';
    output = '<style>div>p.foo+span{border:10px solid #000}</style>';

    equal(minify(input, { minifyCSS: true }), output);
  });

  test('style attribute minification', function() {
    input = '<div style="color: red; background-color: yellow; font-family: Verdana, Arial, sans-serif;"></div>';
    output = '<div style="color:red;background-color:#ff0;font-family:Verdana,Arial,sans-serif"></div>';

    equal(minify(input, { minifyCSS: true }), output);
  });

  test('valueless attributes', function() {
    input = '<br foo>';
    equal(minify(input), input);
  });

  test('newlines becoming whitespaces', function() {
    input = 'test\n\n<input>\n\ntest';
    output = 'test <input> test';
    equal(minify(input, { collapseWhitespace: true }), output);
  });

  test('conservative collapse', function() {
    input = '<b>   foo \n\n</b>';
    output = '<b> foo </b>';
    equal(minify(input, {
      collapseWhitespace: true,
      conservativeCollapse: true
    }), output);
  });

  test('ignore custom comments', function() {
    input = '<!-- ko if: someExpressionGoesHere --><li>test</li><!-- /ko -->';

    equal(minify(input, {
      removeComments: true,
      // ignore knockout comments
      ignoreCustomComments: [
        /^\s+ko/,
        /\/ko\s+$/
      ]
    }), input);

    input = '<!--#include virtual="/cgi-bin/counter.pl" -->';

    equal(minify(input, {
      removeComments: true,
      // ignore Apache SSI includes
      ignoreCustomComments: [
        /^\s*#/
      ]
    }), input);
  });

  test('processScripts', function() {
    input = '<script type="text/ng-template"><!--test--><div>   <span> foobar </span> \n\n</div></script>';
    output = '<script type="text/ng-template"><div><span>foobar</span></div></script>';

    equal(minify(input, {
      collapseWhitespace: true,
      removeComments: true,
      processScripts: [ 'text/ng-template' ]
    }), output);
  });

  test('ignore', function() {

    input = '<!-- htmlmin:ignore --><div class="blah" style="color: red">\n   test   <span> <input disabled/>  foo </span>\n\n   </div><!-- htmlmin:ignore -->' +
            '<div class="blah" style="color: red">\n   test   <span> <input disabled/>  foo </span>\n\n   </div>';

    output = '<!-- htmlmin:ignore --><div class="blah" style="color: red">\n   test   <span> <input disabled/>  foo </span>\n\n   </div><!-- htmlmin:ignore -->' +
            '<div class="blah" style="color: red">test <span><input disabled="disabled"> foo</span></div>';

    equal(minify(input, { collapseWhitespace: true }), output);
  });

  test('meta viewport', function() {

    input = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    output = '<meta name="viewport" content="width=device-width,initial-scale=1">';

    equal(minify(input), output);

    input = '<meta name="viewport" content="initial-scale=1, maximum-scale=1.0">';
    output = '<meta name="viewport" content="initial-scale=1,maximum-scale=1">';

    equal(minify(input), output);

    input = '<meta name="viewport" content="width= 500 ,  initial-scale=1">';
    output = '<meta name="viewport" content="width=500,initial-scale=1">';

    equal(minify(input), output);
  });

})(typeof exports === 'undefined' ? window : exports);
