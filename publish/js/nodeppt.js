;
(function($win, $doc, $B, loadJS, loadCSS, undefined) {
	//用于单页ppt预加载资源
	var preloadFn = {
		loadJS: loadJS,
		loadCSS: loadCSS
	};

	var $body = $doc.body;
	var emptyFn = function() {};
	var emptyArr = [];

	var touchDX = 0; //touch事件x数据
	var touchDY = 0; //touch事件y数据
	var touchStartX = 0;
	var touchStartY = 0;
	var ISSYNC = false;

	var ctrlType = 'bind';
	var doHash = true;
	var lockSlide = false;
	var slideWidth; //单页宽度
	var slideHeight;
	var curIndex = 0; //当前幻灯片索引
	var $progress; //进度条
	var $container; //幻灯片容器
	var $slides; //幻灯片集合
	var $drawBoard; //画板
	var $slideTip;
	var slideCount; //幻灯片总页数-1

	//设置底部进度条

	function setProgress() {
		//添加dataset
		Slide.current = curIndex + 1;
		if ($progress) {
			$progress.style.width = ((curIndex + 1) / (slideCount + 1)) * 100 + '%';
		}
	}

	//泛数组转换为数组

	function toArray(arrayLike) {
		return emptyArr.slice.call(arrayLike);
	}
	//封装选择器

	function $(selector, context) {
		context = (context && context.nodeType === 1) ? context : $doc;
		return context.querySelectorAll(selector);
	}
	//getID方法

	function $$(id) {
		return $doc.getElementById(id);
	}


	//上一页

	function prevSlide() {
		slideOutCallBack($slides[curIndex]);
		--curIndex < 0 && (curIndex = 0);
		doSlide();
	}
	//下一页

	function nextSlide() {
		if (buildNextItem()) {
			// $B.fire('slide change ID',{
			//	slideID:curIndex
			// })
			return;
		}
		slideOutCallBack($slides[curIndex]);
		++curIndex > slideCount && (curIndex = slideCount);
		doSlide();
		preload($slides[curIndex])($slides[curIndex + 1]);
	}
	//slide切入回调incallback
	//<slide data-incallback=""

	function slideInCallBack() {
		var $cur = $slides[curIndex];
		if (!$cur || ($cur && $cur.nodeType !== 1)) {
			return;
		}
		var cb = $cur.dataset.incallback;
		//如果有data-incallback那么就执行callback
		cb && typeof $win[cb] === 'function' && proxyFn(cb);
		//检测iframe
		var $iframe = toArray($('iframe[data-src]', $cur));
		if ($iframe.length) {
			$iframe.forEach(function(v) {
				var src = v.dataset.src;
				v.src = src;
			})

		}
	}
	//slide切出回调outcallback
	//<slide data-outcallback=""

	function slideOutCallBack(prev) {
		if (!prev || (prev && prev.nodeType !== 1)) {
			return;
		}
		var cb = prev.dataset.outcallback;
		//如果有data-outcallback那么就执行callback
		cb && typeof $win[cb] === 'function' && proxyFn(cb);
	}
	//预加载资源
	//<preload data-type="js||css" data-url="">

	function preload(node) {
		var self = arguments.callee;
		if (node && node.nodeType === 1) {
			var $preload = $('preload', node),
				len = $preload.length;
			while (len--) {
				var tmpNode = $preload[len],
					dataset = tmpNode.dataset,
					type = dataset.type,
					url = dataset.url;
				var fn = preloadFn['load' + type.toUpperCase()];
				typeof fn === 'function' && fn(url, function(tmpNode) {
					return function() {
						//将该标签删除，释放内存
						tmpNode.parentNode && tmpNode.parentNode.removeChild(tmpNode);
						tmpNode = null;
					}
				}(tmpNode));
			}
		}
		return self;
	}
	//单行前进

	function buildNextItem() {
		$curSlide = $slides[curIndex];
		var builded = toArray($('.building'), $curSlide);
		var list;
		if (builded.length) {

			while (list = builded.shift()) {
				list = list.classList
				list.remove('building');
				list.add('build-fade');
			}
		}
		var toBuild = $('.to-build', $curSlide);

		if (!toBuild.length) {
			return false;
		}

		var item = toBuild.item(0);
		$B.fire('slide do build', {
			slideID: curIndex,
			build: item.dataset.index
		})
		list = item.classList;

		list.remove('to-build');
		list.add('building');

		return true;
	}
	//设置单行页面添加

	function makeBuildLists() {
		var i = slideCount;
		var slide;
		var transition = defaultOptions.transition;

		while (slide = $slides[i--]) {
			var items = $('.build > *', slide);
			var dataset = slide.dataset;
			for (var j = 0, item; item = items[j]; j++) {
				var t = item.classList
				if (t) {
					t.add('to-build');
					item.dataset.index = j;
				}
			}
			if (!dataset.transition) {
				dataset.transition = transition;
			}
		}

	}

	//切换动画

	function doSlide(slideID, isSync) {
		ISSYNC = typeof isSync === 'boolean' ? isSync : true;
		slideID = slideID === undefined ? curIndex : (slideID | 0);
		curIndex = slideID;

		// $container.style.marginLeft = -(slideID * slideWidth) + 'px';
		updateSlideClass();
		setProgress();
		//发布slide切换状态广播
		ISSYNC && $B.fire('slide change ID', {
			slideID: slideID
		});
		if (doHash) {
			lockSlide = true;
			$win.location.hash = "#" + slideID;
		}
		slideInCallBack();
		removePaint();
		if ($doc.body.classList.contains('overview')) {
			focusOverview_();
			return;
		}
	}

	function updateSlideClass() {
		var curSlide = curIndex;
		for (var i = 0, len = $slides.length; i < len; ++i) {
			switch (i) {
				case curSlide - 2:
					updateSlideClass_(i, 'far-past');
					break;
				case curSlide - 1:
					updateSlideClass_(i, 'past');
					break;
				case curSlide:
					updateSlideClass_(i, 'current');
					break;
				case curSlide + 1:
					updateSlideClass_(i, 'next');
					break;
				case curSlide + 2:
					updateSlideClass_(i, 'far-next');
					break;
				default:
					updateSlideClass_(i);
					break;
			}
		}
	}

	function overview() {
		$doc.body.classList.toggle('overview');
		focusOverview_();
	}

	function focusOverview_() {
		var isOV = $doc.body.classList.contains('overview');
		for (var i = 0, slide; slide = $slides[i]; i++) {
			slide.style.webkitTransform = slide.style.msTransform = slide.style.mozTransform = isOV ?
				'translateZ(-2500px) translate(' + ((i - curIndex) * 105) +
				'%, 0%)' : '';
		}
	}

	function updateSlideClass_(slideNo, className) {
		var el = $slides[slideNo];

		if (!el) {
			return;
		}

		if (className) {
			el.classList.add(className);
		}

		var arr = ['next', 'past', 'far-next', 'far-past', 'current'];
		arr.forEach(function(v) {
			if (className !== v) {
				el.classList.remove(v);
			}
		});

	}

	//显示tips

	function showTips(msg) {
		if (!$slideTip) {
			return;
		}
		$slideTip.innerHTML = msg;
		$slideTip.style.display = 'block';
		setTimeout(function() {
			$slideTip.style.display = 'none';
		}, 3E3);
	}


	/*************************events***************/

	//pc键盘翻页事件逻辑

	function evtDocUp(e) {
		var key = e.keyCode;
		var target = e.target;
		//防止input和textarea，和可以编辑tag
		if (/^(input|textarea)$/i.test(target.nodeName) || target.isContentEditable) {
			return;
		}
		if (!e.isFromControl) {
			switch (key) {
				case 13:
				case 72:
				case 87:
				case 79:
				case 78:
				case 80:
				case 67:
					$B.fire('slide event keyup', e);
					break;
			}
		}
		switch (key) {
			case 13:
				// Enter
				if ($doc.body.classList.contains('overview')) {
					overview();
				}

				break;
			case 72:
				// H: Toggle code highlighting
				$doc.body.classList.toggle('highlight-code');
				break;
			case 87:
				// W: Toggle widescreen
				// Only respect 'w' on body. Don't want to capture keys from an <input>.
				if (!(e.shiftKey && e.metaKey)) {
					$container.classList.toggle('layout-widescreen');
				}
				break;
			case 79:
				// O: Toggle overview
				overview();

				break;
			case 78:
				// N

				$doc.body.classList.toggle('with-notes');
				break;
			case 80:
				showPaint();
				break;
			case 67:
				//c
				removePaint();
				break;
				//上一页
			case 33:
				// pg up
			case 37:
				// left
			case 38:
				// up
				prevSlide();
				break;
				//下一页
			case 9:
				// tab
			case 32:
				// space
			case 34:
				// pg down
			case 39:
				// right
			case 40:
				// down
				nextSlide()
				break;
		}

		//		$container.style.marginLeft = -(curIndex * slideWidth) + 'px';
		//		setProgress();
		//		setHistory();
	}
	/******************************** Touch events *********************/

	function evtTouchStart(event) {
		if (event.touches.length == 1) {
			touchDX = 0;
			touchDY = 0;
			var touch = event.touches[0];
			touchStartX = touch.pageX;
			touchStartY = touch.pageY;
			//捕获，尽早发现事件
			$body.addEventListener('touchmove', evtTouchMove, true);
			$body.addEventListener('touchend', evtTouchEnd, true);
		}
	}
	//touch事件

	function evtTouchMove(event) {
		if (event.touches.length > 1) {
			cancelTouch();
		} else {
			var touch = event.touches[0];

			touchDX = touch.pageX - touchStartX;
			touchDY = touch.pageY - touchStartY;
		}
	}
	//touchend事件

	function evtTouchEnd(event) {
		var dx = Math.abs(touchDX);
		var dy = Math.abs(touchDY);

		if ((dx > 15) && (dy < (dx * 2 / 3))) {
			if (touchDX > 0) {
				prevSlide();
			} else {
				nextSlide();
			}
		}
		cancelTouch();
	}
	//取消绑定

	function cancelTouch() {
		$body.removeEventListener('touchmove', evtTouchMove, true);
		$body.removeEventListener('touchend', evtTouchEnd, true);
	}
	//绑定事件

	function bindEvent() {
		$doc.addEventListener('keyup', evtDocUp, false);
		$body.addEventListener('touchstart', evtTouchStart, false);

		$win.addEventListener('hashchange', function() {
			if (location.hash && !lockSlide) {
				doHash = false;
				slideOutCallBack($slides[curIndex]);
				curIndex = location.hash.substr(1) | 0;

				doSlide();
				doHash = true;
			}
			lockSlide = false;
		}, true);
	}


	/***********画图部分事件处理函数************/
	//画图前准备

	function drawCanvasReady() {
		$drawBoard.context = $drawBoard.getContext('2d');
		var context = $drawBoard.context;
		context.lineWidth = 3;
		context.lineCap = 'round';
		context.strokeStyle = "red";
	}
	//显示画板

	function showPaint() {
		if (!$drawBoard) {
			return;
		}
		$drawBoard.width = $body.clientWidth;
		$drawBoard.height = $body.clientHeight;
		drawCanvasReady();

		$drawBoard.style.display = '';
		$container.style.overflow = 'hidden';

		$drawBoard.addEventListener('mousedown', pMouseDown, true);
		$drawBoard.addEventListener('mouseup', pMouseUp, true);
		$drawBoard.addEventListener('mousemove', pMouseMove, true);
		$doc.addEventListener('selectstart', stopSelect, true);

	}
	//禁止选中

	function stopSelect() {
		return false;
	}
	//清除画板内容

	function clearPaint() {
		$container.style.overflow = '';
		$drawBoard.context && $drawBoard.context.clearRect(0, 0, slideWidth, slideHeight);
		$drawBoard.style.display = 'none';
	}
	//删除画板
	var removePaint = function() {
		clearPaint();
		$drawBoard.removeEventListener('mousedown', pMouseDown);
		$drawBoard.removeEventListener('mouseup', pMouseUp);
		$drawBoard.removeEventListener('mousemove', pMouseMove);
		$doc.removeEventListener('selectstart', stopSelect, true);
	};
	var pMouseDown = function(e) {
		$drawBoard.isMouseDown = true;
		//        $drawBoard.iLastX = e.clientX - $drawBoard.offsetLeft + ($win.pageXOffset || $doc.body.scrollLeft || $doc.documentElement.scrollLeft);
		//        $drawBoard.iLastY = e.clientY - $drawBoard.offsetTop + ($win.pageYOffset || $doc.body.scrollTop || $doc.documentElement.scrollTop);
		$drawBoard.iLastX = e.layerX || e.offsetX || (e.clientX - $drawBoard.offsetLeft + ($win.pageXOffset || $doc.body.scrollLeft || $doc.documentElement.scrollLeft));
		$drawBoard.iLastY = e.layerY || e.offsetY || (e.clientY - $drawBoard.offsetTop + ($win.pageYOffset || $doc.body.scrollTop || $doc.documentElement.scrollTop));
	};
	var pMouseUp = function() {
		$drawBoard.isMouseDown = false;
		$drawBoard.iLastX = -1;
		$drawBoard.iLastY = -1;
	};
	var pMouseMove = function(e) {
		if ($drawBoard.isMouseDown) {
			//            var iX = e.clientX - $drawBoard.offsetLeft + ($win.pageXOffset || $doc.body.scrollLeft || $doc.documentElement.scrollLeft);
			//            var iY = e.clientY - $drawBoard.offsetTop + ($win.pageYOffset || $doc.body.scrollTop || $doc.documentElement.scrollTop);
			var iX = e.layerX || e.offsetX || (e.clientX - $drawBoard.offsetLeft + ($win.pageXOffset || $doc.body.scrollLeft || $doc.documentElement.scrollLeft));
			var iY = e.layerY || e.offsetY || (e.clientY - $drawBoard.offsetTop + ($win.pageYOffset || $doc.body.scrollTop || $doc.documentElement.scrollTop));
			var context = $drawBoard.context;
			context.beginPath();
			context.moveTo($drawBoard.iLastX, $drawBoard.iLastY);
			context.lineTo(iX, iY);
			context.stroke();
			$drawBoard.iLastX = iX;
			$drawBoard.iLastY = iY;
		}
	};

	//代理函数，用于函数控制

	function proxyFn(fnName, args) {
		$win[fnName](args);
	}

	/**
	 * 默认配置
	 * @type {Object}
	 */
	var defaultOptions = {
		containerID: 'container',
		isControlDevice: false,
		drawBoardID: 'drawBoard',
		slideClass: '.slide',
		buildClass: '.build',
		progressID: 'progress',
		transition: '',
		tipID: 'tip',
		webSocketHost: '',
		width: 900,
		dir: './',
		height: 700,
		control: false
	};

	//初始化变量

	function initVar() {

		$slideTip = $$(defaultOptions.tipID);
		$container = $$(defaultOptions.containerID);
		slideWidth = defaultOptions.width;
		slideHeight = defaultOptions.height;
		$progress = $$(defaultOptions.progressID);
		Slide.$slides = $slides = toArray($(defaultOptions.slideClass, $container));



		slideCount = $slides.length; //幻灯片总页数-1
		Slide.count = slideCount;

		// $container.style.width = slideCount*slideWidth + 'px';//设置容器总宽度
		slideCount--;
		$drawBoard = $$(defaultOptions.drawBoardID);
		if ($drawBoard) {
			$drawBoard.style.display = 'none';
		}
	}

	function fullImg() {

		loadJS(defaultOptions.dir + 'img.screenfull.js', function() {
			//图片处理
			var $imgs = toArray($(defaultOptions.slideClass + ' img', $container));
			screenfull($imgs);
		});
	}
	//初始化

	function init(options) {
		options = options || {};

		for (var key in defaultOptions) {
			if ( !! (key in options)) {
				defaultOptions[key] = options[key];
			}
		}
		Slide.dir = defaultOptions.dir;
		if (defaultOptions.control) {
			var control = defaultOptions.control;
			loadJS(defaultOptions.dir + 'nodeppt.control.js', function() {
				Slide.Control.load(control.type, control.args);
			});
		}


		initVar(); //初始化变量
		makeBuildLists();
		fullImg(); //图片全屏
		bindEvent();

		if (location.hash && (curIndex = (location.hash.substr(1) | 0))) {
			doSlide();
		} else {
			updateSlideClass();
			setProgress();
			slideInCallBack();
		}
		preload($slides[curIndex])($slides[curIndex + 1]);
		$body.style.opacity = 1;
	}
	var Slide = {
		init: init,
		next: nextSlide,
		prev: prevSlide,
		doSlide: doSlide,
		proxyFn: proxyFn
	}

	$win.Slide = Slide;

}(window, document, MixJS.event.broadcast, MixJS.loadJS, MixJS.loadCSS));
