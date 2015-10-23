/* Usage:
 *
 * var hide = new Hide();
 * hide.setStyles = function(elem) {
 *   elem.style.backgroundColor = "#fff";
 * };
 * hide.hideMore('className');
 *
 * OR
 *
 * var hide = new Hide();
 * hide.setStyles = function(elem) {
 *   elem.style.backgroundColor = "#fff";
 * };
 * var scrollElem = document.getElemenByID('scrollID');
 * hide.hideMore('className', scrollElem);
 *
 */

function Hide(topBound, bottomBound) {
  topBound = topBound || 0;
  bottomBound = bottomBound || 0;

  var hiddenContent = {};
  var already = 0;
  var hideObj = this;

  this.setStyles = function(elem) { };

  function isShowing(elem, scrollElem) {
    function posY(elem, scrollElem) {
      var fromTop = 0;

      while (!!elem && elem !== scrollElem) {
        fromTop = fromTop + elem.offsetTop;
        elem = elem.offsetParent;
      }

      return fromTop;
    }

    function viewHeight(scrollElem) {
      if (scrollElem !== window) {
        return scrollElem.clientHeight;
      }
      var de = document.documentElement;

      if (!!window.innerWidth) {
        return window.innerHeight;
      }

      if (de && !isNaN(de.clientHeight)) {
        return de.clientHeight;
      }

      return 0;
    }

    function scrollY(scrollElem) {
      if (scrollElem !== window) {
        return scrollElem.scrollTop;
      }

      if (window.pageYOffset) {
        return window.pageYOffset;
      }

      return Math.max(document.documentElement.scrollTop, document.body.scrollTop);
    }

    var top = ((posY(elem, scrollElem)
          > (scrollY(scrollElem)
            - topBound))
        && (posY(elem, scrollElem)
          < (scrollY(scrollElem)
            + viewHeight(scrollElem)
            + bottomBound)));
    var bottom = (((posY(elem, scrollElem)
            + elem.clientHeight)
          > (scrollY(scrollElem)
            - topBound))
        && ((posY(elem, scrollElem)
            + elem.clientHeight)
          < (scrollY(scrollElem)
            + viewHeight(scrollElem)
            + bottomBound)));
    return top || bottom;
  }

  function showElem(elem) {
    var id = elem.getAttribute('elem_id');
    if (!!hiddenContent[id]) {
      elem.innerHTML = hiddenContent[id];
      elem.removeAttribute('style');
      delete hiddenContent[id];
    }
  }

  function hideElem(elem) {
    var id = elem.getAttribute('elem_id');
    var clientHeight = elem.clientHeight;

    if (!hiddenContent[id] && clientHeight !== 0) {
      elem.style.height = clientHeight + 'px';
      hiddenContent[id] = elem.innerHTML;
      elem.innerHTML = '';
      hideObj.setStyles(elem);

      if (elem.clientHeight === 0) {
        showElem(elem);
      }
    }
  }

  function scrollFunc(elem, scrollElem) {
    return function () {
      if (!isShowing(elem, scrollElem)) {
        hideElem(elem);
      }
      else {
        showElem(elem);
      }
    };
  }

  this.hideMore = function(hideClass, scrollElem) {
    scrollElem = scrollElem || window;
    var elements = document.getElementsByClassName(hideClass);

    var throttle = function(type, name, obj) {
      obj = obj || window;

      var running = false;
      var func = function() {
        if (running) { return; }
        running = true;
        requestAnimationFrame(function() {
          obj.dispatchEvent(new CustomEvent(name));
          running = false;
        });
      };
      obj.addEventListener(type, func);
    };

    throttle ('scroll', 'optimizedScroll', scrollElem);

    for (already; already < elements.length; already += 1) {
      elements[already].setAttribute('elem_id', already);
      scrollElem.addEventListener("optimizedScroll", scrollFunc(elements[already], scrollElem), false);
    }
  };
}
