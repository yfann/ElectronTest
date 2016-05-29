window.onload=function(){
    

;(function (container) {
	var shakeTime = 0,
		shakeTimeMax = 0,
		shakeIntensity = 5,
		lastTime = 0,
		particles = [],
		particlePointer = 0,
		MAX_PARTICLES = 500,
		PARTICLE_NUM_RANGE = { min: 5, max: 10 },
		PARTICLE_GRAVITY = 0.08,
		PARTICLE_ALPHA_FADEOUT = 0.96,
		PARTICLE_VELOCITY_RANGE = {
			x: [-1, 1],
			y: [-3.5, -1.5]
		},
		w = window.innerWidth,
		h = window.innerHeight,
		effect=2,
		isActive = false;

	var cmNode=container;
	var canvas, ctx;
	var throttledShake = throttle(shake, 100);
	var throttledSpawnParticles = throttle(spawnParticles, 100);

	function getRGBComponents(node) {
		return [255, 0, 0];
		// var color = getComputedStyle(node).color;
		// if (color) {
		// 	try {
		// 		return color.match(/(\d+), (\d+), (\d+)/).slice(1);
		// 	} catch(e) {
		// 		return [255, 255, 255];
		// 	}
		// } else {
		// 	return [255, 255, 255];
		// }
	}
    //add pos
	function spawnParticles(pos) {
		var node = document.elementFromPoint(pos.left - 5, pos.top + 5);
		var numParticles = random(PARTICLE_NUM_RANGE.min, PARTICLE_NUM_RANGE.max);
		var color = getRGBComponents(node);
		for (var i = numParticles; i--;) {
			particles[particlePointer] = createParticle(pos.left + 10, pos.top, color);
			particlePointer = (particlePointer + 1) % MAX_PARTICLES;
		}
	}

	function createParticle(x, y, color) {
		var p = {
			x: x,
			y: y + 10,
			alpha: 1,
			color: color
		};
		if (effect === 1) {
			p.size = random(2, 4);
			p.vx = PARTICLE_VELOCITY_RANGE.x[0] + Math.random() *
					(PARTICLE_VELOCITY_RANGE.x[1] - PARTICLE_VELOCITY_RANGE.x[0]);
			p.vy = PARTICLE_VELOCITY_RANGE.y[0] + Math.random() *
					(PARTICLE_VELOCITY_RANGE.y[1] - PARTICLE_VELOCITY_RANGE.y[0]);
		} else if (effect === 2) {
			p.size = random(2, 8);
			p.drag = 0.92;
			p.vx = random(-3, 3);
			p.vy = random(-3, 3);
			p.wander = 0.15;
			p.theta = random(0, 360) * Math.PI / 180;
		}
		return p;
	}

	function effect1(particle) {
		particle.vy += PARTICLE_GRAVITY;
		particle.x += particle.vx;
		particle.y += particle.vy;

		particle.alpha *= PARTICLE_ALPHA_FADEOUT;

		ctx.fillStyle = 'rgba('+ particle.color[0] +','+ particle.color[1] +','+ particle.color[2] + ',' + particle.alpha + ')';
		ctx.fillRect(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, particle.size);
	}

	// Effect based on Soulwire's demo: http://codepen.io/soulwire/pen/foktm
	function effect2(particle) {
		particle.x += particle.vx;
		particle.y += particle.vy;
		particle.vx *= particle.drag;
		particle.vy *= particle.drag;
		particle.theta += random( -0.5, 0.5 );
		particle.vx += Math.sin( particle.theta ) * 0.1;
		particle.vy += Math.cos( particle.theta ) * 0.1;
		particle.size *= 0.96;

		ctx.fillStyle = 'rgba('+ particle.color[0] +','+ particle.color[1] +','+ particle.color[2] + ',' + particle.alpha + ')';
		ctx.beginPath();
		ctx.arc(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, 0, 2 * Math.PI);
		ctx.fill();
	}

	function drawParticles(timeDelta) {
		var particle;
		for (var i = particles.length; i--;) {
			particle = particles[i];
			if (!particle || particle.alpha < 0.01 || particle.size <= 0.5) { continue; }

			if (effect === 1) { effect1(particle); }
			else if (effect === 2) { effect2(particle); }
		}
	}

	function shake(time) {
		shakeTime = shakeTimeMax = time;
	}

	function random(min, max) {
		if (!max) { max = min; min = 0; }
		return min + ~~(Math.random() * (max - min + 1))
	}

	function throttle (callback, limit) {
		var wait = false;
		return function () {
			if (!wait) {
				callback.apply(this, arguments);
				wait = true;
				setTimeout(function () {
					wait = false;
				}, limit);
			}
		}
	}

	function loop() {
		if (!isActive) { return; }

		ctx.clearRect(0, 0, w, h);

		// get the time past the previous frame
		var current_time = new Date().getTime();
		if(!lastTime) lastTime = current_time;
		var dt = (current_time - lastTime) / 1000;
		lastTime = current_time;

		if (shakeTime > 0) {
			shakeTime -= dt;
			var magnitude = (shakeTime / shakeTimeMax) * shakeIntensity;
			var shakeX = random(-magnitude, magnitude);
			var shakeY = random(-magnitude, magnitude);
			cmNode.style.transform = 'translate(' + shakeX + 'px,' + shakeY + 'px)';
		}
		drawParticles();
		requestAnimationFrame(loop);
	}

	function onCodeMirrorChange(event) {
		throttledShake(0.3);
        var position = getSelectionCoords();
        console.log(position);
		throttledSpawnParticles({left:position.x,top:position.y});
	}

    function getSelectionCoords(win) {
    win = win || window;
    var doc = win.document;
    var sel = doc.selection, range, rects, rect;
    var x = 0, y = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(true);
            x = range.boundingLeft;
            y = range.boundingTop;
        }
    } else if (win.getSelection) {
        sel = win.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                range.collapse(true);
                rects = range.getClientRects();
                if (rects.length > 0) {
                    rect = rects[0];
                }
                x = rect.left;
                y = rect.top;
            }
            // Fall back to inserting a temporary element
            if (x == 0 && y == 0) {
                var span = doc.createElement("span");
                if (span.getClientRects) {
                    // Ensure span has dimensions and position by
                    // adding a zero-width space character
                    span.appendChild( doc.createTextNode("\u200b") );
                    range.insertNode(span);
                    rect = span.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                    var spanParent = span.parentNode;
                    spanParent.removeChild(span);

                    // Glue any broken text nodes back together
                    spanParent.normalize();
                }
            }
        }
    }
    return { x: x, y: y };
}


	function init() {
		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d'),

		canvas.id = 'code-blast-canvas'
		canvas.style.position = 'absolute';
		canvas.style.top = 0;
		canvas.style.left = 0;
		canvas.style.zIndex = 1;
		canvas.style.pointerEvents = 'none';
		canvas.width = w;
		canvas.height = h;

		document.body.appendChild(canvas);

		isActive = true;
		loop();

		cmNode.addEventListener("input", onCodeMirrorChange);
	}

	// function destroy() {
	// 	isActive = false;
	// 	cmNode.removeEventListener('input', onCodeMirrorChange);
	// 	if (canvas) { canvas.remove(); }
	// }


    init();
    
    
})(document.body);

};
