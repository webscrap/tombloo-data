
alert('99.model.google.js');


(function() {
	var enables = ['Google+'];//,'Google+ Bookmarks'];
	function getCircles(gplus) {
		var target = getPref('googleplus.circles');
		//alert('circles regexp: ' + target);
		if(!target) {
			return [];
		}
		return gplus.getInitialData(12).addCallback(function(data) {
	        let circles = [];
	        if (data) {
	            data[0].forEach(function(circle) {
	                let code, name, desc, has;
	                code = xUtils.stringify(circle[0][0]);
	                if (code) {
	                    has = false;
	                    circles.forEach(function(c) {
	                        if (!has && c.code === code) {
	                            has = true;
	                        }
	                    });
	                    if (!has) {
	                        name = xUtils.stringify(circle[1][0]);
	                        desc = xUtils.stringify(circle[1][2]);
	                        if (name) {
	                            circles[circles.length] = {
	                                code : code,
	                                name : name,
	                                desc : desc
	                            };
	                        }
	                    }
	                }
	            });
	        }
			let pass = [];
			circles.forEach(function(c) {
				//alert('c.name = ' + c.name);
				if(c.name.match(target)) {
					//alert(c.name + ' matched');
					pass.push(c);
				}
			});
	        return pass;
		});
	};
	for(var i = 0;i<enables.length;i++) {
		var self = models[enables[i]];
		if(self) {
			self.ICON = "https://ssl.gstatic.com/s2/oz/images/faviconr2.ico";
			addAround(self,'_post',function(saved,args) {
				return getCircles(self).addCallback(function(circles) {
					//alert(JSON.stringify(circles));
					var r;
					if(circles && circles.length) {
						let scope = [];
						let oz = args[1];
						for(var i=0;i<circles.length;i++) {
							var ops = circles[i];
							scope.push({
			                    scope : {
			                        scopeType   : 'focusGroup',
			                        name        : ops.name,
			                        id          : [oz[2][0], ops.code].join('.'),
			                        me          : false,
			                        requiresKey : false,
			                        groupType   : 'p'
			                    },
			                    role : 20
			                });
							scope.push({
			                    scope : {
			                        scopeType   : 'focusGroup',
			                        name        : ops.name,
			                        id          : [oz[2][0], ops.code].join('.'),
			                        me          : false,
			                        requiresKey : false,
			                        groupType   : 'p'
			                    },
			                    role : 60
			                });
						}
						r = JSON.stringify({aclEntries : scope});
						alert(r);
						self.createScopeSpar = function() {return r};
					}
					return saved(args);
				});
			});
			addAround(self,'post',function(ori_func,args) {
				let oldps = args[0];
				var ps = modelExt.createPost(oldps);
				var tagtext = '';
				if(ps.tags) {
					tagtext = '#' + joinText(ps.tags,' #');
				}
				ps.description = ps.description ? ps.description + ' ' + tagtext : tagtext;
				args[0] = ps;
				alert(ps.description);
				return ori_func(args);
			});
		}
	}
}) ();
