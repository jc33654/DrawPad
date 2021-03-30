$(document).ready(function() {
    // global variables
    $('.canvasContant').html(`<canvas id="canvasDiv" width='${window.innerWidth * 0.95}' height='${window.innerHeight * 0.72}'></canvas>`);
    var canvas = document.getElementById('canvasDiv');
    var context = canvas.getContext('2d');
    var drawing = false;
    var queue = [];
    var start = [];
    var tool = $C(context);
    var lineWidthText;
    var isMobile = false;



    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        isMobile = true;
    }



    // drawing tool setup
    tool.on('drawType', function(v) {
        if (v === 'drawText') {
            $('.toolsFont').show();
        } else {
            $('.toolsFont').hide();
        }
        $('.toolsButton button').removeClass('beChosen');
        $('#' + v).addClass('beChosen');
    });
    tool.lineCap = 'round';
    tool.lineJoin = 'round';
    tool.lineWidth = 1;

    // color picker setup
    $('#color1').colorPicker({
        pickerDefault: 'ffffff',
        onColorChange: function(id, val) {
            tool.fillStyle = val;
            tool.strokeStyle = val;
        }
    });
    tool.on('fillStyle', function(val) {
        $('#keyin').css('color', val);
    });
    tool.on('font', function(val) {
        $('#keyin').css('font', val);
    });
    $('#keyin').bind('keypress', function(e) {
        if (e.which == '13') {
            tool.do($(this).val(), start[0], start[1]);
            start = [];
            drawing = false;
            $(this).css('display', 'none');
            $(this).val('');
            addHistory();
        }
    });


    // mouse
    canvas.addEventListener('mousedown', drawingStart);
    canvas.addEventListener('mousemove', drawingMove);
    canvas.addEventListener('mouseup', drawingEnd);
    canvas.addEventListener('mouseleave', drawingLeave);
    // touch
    canvas.addEventListener('touchstart', drawingStart);
    canvas.addEventListener('touchmove', drawingMove);
    canvas.addEventListener('touchend', drawingEnd);
    canvas.addEventListener('touchcancel', drawingLeave);


    //drawing dom event
    function drawingStart(e) {
        e.preventDefault();
        drawImage.src = context.canvas.toDataURL('image/png');
        if (!drawing && tool.drawType === 'drawText') {
            e.stopPropagation();
            var offset = $('#canvasDiv').offset();
            tool.ctx.textBaseline = 'middle';
            if (isMobile) {
                $('#keyin').css('left', e.changedTouches[0].pageX - offset.left + 30 + 'px');
                $('#keyin').css('top', e.changedTouches[0].pageY - offset.top - $('#keyin').innerHeight() / 2 + 25 + 'px');
            } else {
                $('#keyin').css('left', e.offsetX + 30 + 'px');
                $('#keyin').css('top', e.offsetY - $('#keyin').innerHeight() / 2 + 25 + 'px');
            }
            $('#keyin').show();
            $('#keyin').focus();
            drawing = true;
            if (isMobile) {
                start = [e.changedTouches[0].pageX - offset.left, e.changedTouches[0].pageY - offset.top];
            } else {
                start = [e.pageX - offset.left, e.pageY - offset.top];
            }
        }
        if (tool.drawType !== 'drawText') {
            $('#keyin').hide();
        }
        if (!drawing && tool.drawType !== 'drawText') {
            $(this).data('cursor', $(this).css('cursor'));
            $(this).css('cursor', 'pointer');
            drawing = true;
            if (tool.drawType == 'strokeRect' ||
                tool.drawType == 'fillRect' ||
                tool.drawType == 'strokeCircle' ||
                tool.drawType == 'fillCircle' ||
                tool.drawType == 'strokeEclipse' ||
                tool.drawType == 'fillEclipse' ||
                tool.drawType == 'straightLine' ||
                tool.drawType == 'clear' ||
                tool.drawType == 'undo' ||
                tool.drawType == 'redo') {
                tool.pushCanvas();
            }
            var offset = $(e.currentTarget).offset()
            if (isMobile) {
                var x = e.changedTouches[0].pageX - offset.left;
                var y = e.changedTouches[0].pageY - offset.top;
            } else {
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
            }
            tool.do(x, y, x, y);
            queue.push([x, y]);
        }
    };

    function drawingMove(e) {
        e.preventDefault();
        if (drawing && tool.drawType !== 'drawText') {
            var old = queue.shift();
            if (tool.drawType == 'strokeRect' ||
                tool.drawType == 'fillRect' ||
                tool.drawType == 'strokeCircle' ||
                tool.drawType == 'fillCircle' ||
                tool.drawType == 'strokeEclipse' ||
                tool.drawType == 'fillEclipse' ||
                tool.drawType == 'straightLine' ||
                tool.drawType == 'clear' ||
                tool.drawType == 'undo' ||
                tool.drawType == 'redo') {
                tool.restoreCanvas();
                queue.push(old);
            }
            var offset = $(e.currentTarget).offset();
            if (isMobile) {
                var x = e.changedTouches[0].pageX - offset.left;
                var y = e.changedTouches[0].pageY - offset.top;
            } else {
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
            }
            tool.do(old[0], old[1], x, y);
            if (tool.drawType == 'freestyle' ||
                tool.drawType == 'eraser') {
                queue.push([x, y]);
            }
        }
    };

    function drawingEnd(e) {
        if (drawing && tool.drawType === 'drawText') {
            drawing = false;
        }
        if (drawing && tool.drawType !== 'drawText') {
            $(this).css('cursor', $(this).data('cursor'));
            tool.dropCanvas();
            var old = queue.shift();
            var offset = $(e.currentTarget).offset();
            if (isMobile) {
                var x = e.changedTouches[0].pageX - offset.left;
                var y = e.changedTouches[0].pageY - offset.top;
            } else {
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
            }
            tool.do(old[0], old[1], x, y);
            drawing = false;
        }
        if (tool.drawType !== 'undo' && tool.drawType !== 'redo' && tool.drawType !== 'drawText') {
            addHistory();
        }
    };

    function drawingLeave(e) {
        if (drawing && tool.drawType !== 'drawText') {
            $(this).css('cursor', $(this).data('cursor'));
            tool.dropCanvas();
            var old = queue.shift();
            var offset = $(e.currentTarget).offset();
            if (isMobile) {
                var x = e.changedTouches[0].pageX - offset.left;
                var y = e.changedTouches[0].pageY - offset.top;
            } else {
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
            }
            tool.do(old[0], old[1], x, y);
            drawing = false;
        }
    };




    // tool panel event
    $('#linewidth').bind('change', function() {
        tool.lineWidth = $(this).val();
    });
    $('#freestyle').bind('click', function() {
        tool.drawType = 'freestyle';
    });
    $('#strokeRect').bind('click', function() {
        tool.drawType = 'strokeRect';
    });
    $('#fillRect').bind('click', function() {
        tool.drawType = 'fillRect';
    });
    $('#strokeCircle').bind('click', function() {
        tool.drawType = 'strokeCircle';
    });
    $('#fillCircle').bind('click', function() {
        tool.drawType = 'fillCircle';
    });
    $('#strokeEclipse').bind('click', function() {
        tool.drawType = 'strokeEclipse';
    });
    $('#fillEclipse').bind('click', function() {
        tool.drawType = 'fillEclipse';
    });
    $('#drawText').bind('click', function() {
        tool.drawType = 'drawText';
    });
    $('#fontface').bind('change', function() {
        tool.fontFace = $(this).val();
    });
    $('#fontsize').bind('change', function() {
        tool.fontSize = $(this).val();
    });
    $('#fontweight').bind('change', function() {
        tool.fontWeight = $(this).val();
    });
    $('#fontstyle').bind('change', function() {
        tool.fontStyle = $(this).val();
    });
    $('#eraser').bind('click', function() {
        tool.drawType = 'eraser';
    });
    $('#straightLine').bind('click', function() {
        tool.drawType = 'straightLine';
    });
    $('#clear').bind('click', function() {
        tool.drawType = 'clear';
        tool.do(clear);
        addHistory();
    });
    $('#undo').bind('click', function() {
        tool.drawType = 'undo';
        tool.do(undo);
    });
    $('#redo').bind('click', function() {
        tool.drawType = 'redo';
        tool.do(redo);

    });



    // function
    // 記錄歷史(操作)
    function addHistory() {
        let dataUrl = canvas.toDataURL('image/png');
        historyUrls.push(dataUrl);
        let length = historyUrls.length;
        if (length > 10) {
            historyUrls = historyUrls.slice(-10, length);
        }
        historyUrlsIndex = historyUrls.length - 1;
    }
    // 儲存
    function saveUrl() {
        let dataUrl = canvas.toDataURL('image/png');
    }
});


// tool setting
var drawImage = new Image();
var historyUrls = [];
var historyUrlsIndex = -1;
var historyImage = new Image();
var document = window.document;
var tools = {},
    queue = [],
    clones = [];
var PaintToolsProto = {
    _drawType: 'freestyle',
    _fontFace: 'sans-serif',
    _fontSize: '10px',
    _fontWeight: '400',
    _fontStyle: 'normal',
    get fillStyle() {
        return this.ctx.fillStyle;
    },
    set fillStyle(val) {
        this.ctx.fillStyle = val;
        this.emit('fillStyle', val);
    },
    get strokeStyle() {
        return this.ctx.strokeStyle;
        this.emit('fillStyle', val);
    },
    set strokeStyle(val) {
        this.ctx.strokeStyle = val;
        this.emit('fillStyle', val);
    },
    get lineWidth() {
        return this.ctx.lineWidth;
    },
    set lineWidth(val) {
        this.ctx.lineWidth = val;
        this.emit('lineWidth', val);
    },
    get lineCap() {
        return this.ctx.lineCap;
    },
    set lineCap(val) {
        this.ctx.lineCap = val;
        this.emit('lineCap', val);
    },
    get lineJoin() {
        return this.ctx.lineJoin;
    },
    set lineJoin(val) {
        this.ctx.lineJoin = val;
        this.emit('lineJoin', val);
    },
    get drawType() {
        return this._drawType;
    },
    set drawType(val) {
        this._drawType = val;
        this.emit('drawType', val);
    },
    get fontFace() {
        return this._fontFace;
    },
    set fontFace(val) {
        this._fontFace = val;
        this.ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + ' ' + this.fontFace;
        this.emit('fontFace', val);
        this.emit('font', this.ctx.font);
    },
    get fontSize() {
        return this._fontSize;
    },
    set fontSize(val) {
        this._fontSize = val;
        this.ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + ' ' + this.fontFace;
        this.emit('fontSize', val);
        this.emit('font', this.ctx.font);
    },
    get fontWeight() {
        return this._fontWeight;
    },
    set fontWeight(val) {
        this._fontWeight = val;
        this.ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + ' ' + this.fontFace;
        this.emit('fontWeight', val);
        this.emit('font', this.ctx.font);
    },
    get fontStyle() {
        return this._fontStyle;
    },
    set fontStyle(val) {
        this._fontStyle = val;
        this.ctx.font = this.fontStyle + ' ' + this.fontWeight + ' ' + this.fontSize + ' ' + this.fontFace;
        this.emit('fontStyle', val);
        this.emit('font', this.ctx.font);
    }
};
window['$C'] = function(ctx) {
    var ret = new PaintTools(ctx);
    ret.regist(freestyle);
    ret.regist(straightLine);
    ret.regist(strokeRect);
    ret.regist(fillRect);
    ret.regist(strokeCircle);
    ret.regist(fillCircle);
    ret.regist(strokeEclipse);
    ret.regist(fillEclipse);
    ret.regist(drawText);
    ret.regist(eraser);
    ret.regist(clear);
    ret.regist(undo);
    ret.regist(redo);

    return ret;
}
var PaintTools = function(_ctx) {
    this.ctx = _ctx;
    this.emitter = EventEmitter;
    this.emitter();
    delete this.emitter;
};
PaintTools.prototype = PaintToolsProto;
PaintTools.prototype.regist = function(tool) {
    if (typeof tool.type !== 'undefined' && typeof tool.run !== 'undefined') {
        tools[tool.type] = tool;
    }
};
PaintTools.prototype.do = function() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    if (typeof tools[this.drawType] !== 'undefined') {
        tools[this.drawType].run.apply(this, args);
    }
};
PaintTools.prototype.pushCanvas = function() {
    clones.push(this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height));
};
PaintTools.prototype.popCanvas = function() {
    if (clones.length > 0) {
        this.ctx.putImageData(clones.pop(), 0, 0);
    }
};
PaintTools.prototype.restoreCanvas = function() {
    if (clones.length > 0) {
        this.ctx.putImageData(clones[0], 0, 0);
    }
};
PaintTools.prototype.dropCanvas = function() {
    if (clones.length > 0) {
        clones.pop();
    }
}
var freestyle = {
    type: 'freestyle',
    run: function(x, y, x1, y1) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x1, y1);
        this.ctx.closePath();
        this.ctx.stroke();
    }
}
var straightLine = {
    type: 'straightLine',
    run: function(x, y, x1, y1) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(drawImage, 0, 0);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x1, y1);
        this.ctx.closePath();
        this.ctx.stroke();
    }
}
var strokeRect = {
    type: 'strokeRect',
    run: function(x, y, x1, y1) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(drawImage, 0, 0);
        this.ctx.beginPath();
        this.ctx.rect(x, y, x1 - x, y1 - y);
        this.ctx.closePath();
        this.ctx.stroke();
    }
}
var fillRect = {
    type: 'fillRect',
    run: function(x, y, x1, y1) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(drawImage, 0, 0);
        this.ctx.beginPath();
        this.ctx.rect(x, y, x1 - x, y1 - y);
        this.ctx.closePath();
        this.ctx.fill();
    }
}
var strokeCircle = {
    type: 'strokeCircle',
    run: function(x1, y1, x2, y2) {
        var radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 2);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(drawImage, 0, 0);
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, radius, 0, 2 * Math.PI, true);
        this.ctx.closePath();
        this.ctx.stroke();
    }
}
var fillCircle = {
    type: 'fillCircle',
    run: function(x1, y1, x2, y2) {
        var radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 2);
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(drawImage, 0, 0);
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, radius, 0, 2 * Math.PI, true);
        this.ctx.closePath();
        this.ctx.fill();
    }
}
var strokeEclipse = {
    type: 'strokeEclipse',
    run: function(x1, y1, x2, y2) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(drawImage, 0, 0);
        this.ctx.beginPath();
        var xc1 = x1,
            yc1 = y1 - Math.abs(y2 - y1),
            xc2 = x2,
            yc2 = y1 - Math.abs(y2 - y1),
            xx2 = x2,
            yy2 = y1,
            xc3 = x2,
            yc3 = y1 + Math.abs(y2 - y1),
            xc4 = x1,
            yc4 = y1 + Math.abs(y2 - y1);
        this.ctx.moveTo(x1, y1);
        this.ctx.bezierCurveTo(xc1, yc1, xc2, yc2, xx2, yy2);
        this.ctx.bezierCurveTo(xc3, yc3, xc4, yc4, x1, y1);
        this.ctx.closePath();
        this.ctx.stroke();
    }
}
var fillEclipse = {
    type: 'fillEclipse',
    run: function(x1, y1, x2, y2) {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(drawImage, 0, 0);
        this.ctx.beginPath();
        var xc1 = x1,
            yc1 = y1 - Math.abs(y2 - y1),
            xc2 = x2,
            yc2 = y1 - Math.abs(y2 - y1),
            xx2 = x2,
            yy2 = y1,
            xc3 = x2,
            yc3 = y1 + Math.abs(y2 - y1),
            xc4 = x1,
            yc4 = y1 + Math.abs(y2 - y1);
        this.ctx.moveTo(x1, y1);
        this.ctx.bezierCurveTo(xc1, yc1, xc2, yc2, xx2, yy2);
        this.ctx.bezierCurveTo(xc3, yc3, xc4, yc4, x1, y1);
        this.ctx.closePath();
        this.ctx.fill();
    }
}
var drawText = {
    type: 'drawText',
    run: function(text, x, y) {
        this.ctx.textAlign = 'left';
        this.ctx.fillText(text, x, y, this.ctx.measureText(text).width);
    }
}
var eraser = {
    type: 'eraser',
    run: function(x, y, x1, y1) {
        eraserWidth = this.ctx.lineWidth;
        this.ctx.clearRect(x - eraserWidth, y - eraserWidth, eraserWidth, eraserWidth);
        var d = Math.abs(x1 - x);
        var xt = x,
            yt = y;
        for (var i = 0; i < d; i++) {
            xt += (x1 - x) / d;
            yt += (y1 - y) / d;
            this.ctx.clearRect(xt - eraserWidth, Math.round(yt) - eraserWidth, eraserWidth, eraserWidth);
        }
        this.ctx.clearRect(x1 - eraserWidth, y1 - eraserWidth, eraserWidth, eraserWidth);
    }
}
var undo = {
    type: 'undo',
    run: function() {
        let currentIndex = historyUrlsIndex - 1;
        if (currentIndex < 0) {
            if (currentIndex === -1) {
                this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            }
            historyUrlsIndex = -1;
            return;
        }
        historyUrlsIndex = currentIndex;
        historyImage.src = historyUrls[currentIndex];
        // console.log(historyImage.src)
        historyImage.onload = () => {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.drawImage(historyImage, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        };


    }
}
var redo = {
    type: 'redo',
    run: function() {
        let length = historyUrls.length;
        let currentIndex = historyUrlsIndex + 1;
        // console.log(currentIndex, historyUrlsIndex)
        if (currentIndex > length - 1) {
            historyUrlsIndex = length - 1;
            return;
        };
        historyUrlsIndex = currentIndex;
        // console.log(historyImage.src);
        historyImage.src = historyUrls[currentIndex];
        historyImage.onload = () => {
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.drawImage(historyImage, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        };
    }
}
var clear = {
    type: 'clear',
    run: function() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}




function EventEmitter() {
    var handlers = {};
    this.on = function(name, fn) {
        if (typeof handlers[name] == 'undefined') handlers[name] = [];
        handlers[name].push(fn);
    };
    this.emit = function() {
        var name = arguments[0];
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        if (typeof handlers[name] !== 'undefined') {
            handlers[name].forEach(function(fn) {
                fn.apply(this, args);
            })
        }
    };
}