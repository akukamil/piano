var M_WIDTH=800, M_HEIGHT=450;
var app ={stage:{},renderer:{}}, game_res, objects={}, game_tick=0,audio_context, my_turn=false, room_name = '', LANG = 0, git_src;
var any_dialog_active=0, some_process = {}, game_platform='';
var my_data={opp_id : ''},opp_data={};
var avatar_loader;
var speed=0.95;

class song_card_class extends PIXI.Container{
		
	constructor(){
		
		super();
		
		this.song_id=0;
											
		this.avatar_bcg=new PIXI.Sprite();
		this.avatar_bcg.width=70;
		this.avatar_bcg.height=70;	
				
		this.avatar=new PIXI.Sprite();
		this.avatar.x=30;
		this.avatar.width=70;
		this.avatar.height=70;
		
		this.avatar_frame=new PIXI.Sprite();
		this.avatar_frame.width=70;
		this.avatar_frame.height=70;
				
		this.artist_name=new PIXI.BitmapText('123', {fontName: 'mfont',fontSize: 30}); 
		this.artist_name.x=120;
		this.artist_name.y=10;
		this.artist_name.tint=0x110022;
		
		this.song_name=new PIXI.BitmapText('123', {fontName: 'mfont',fontSize: 25}); 
		this.song_name.x=120;
		this.song_name.y=40;
		this.song_name.tint=0x0000ff;
		
		this.card_num=new PIXI.BitmapText('1', {fontName: 'mfont',fontSize: 35}); 
		this.card_num.x=10;
		this.card_num.y=35;
		this.card_num.anchor.set(0.5,0.5);
		this.card_num.tint=0x333333;
		
		this.bottom_line=new PIXI.Sprite(gres.bottom_line.texture);
		this.bottom_line.y=70;
		this.bottom_line.anchor.set(0,0.5);
		
		this.lock=new PIXI.Sprite(gres.lock.texture);
		this.lock.x=400;
		this.lock.y=35;
		this.lock.width=60;
		this.lock.height=60;
		this.lock.anchor.set(0.5,0.5);
		
		
		this.visible=false;
		this.addChild(this.avatar_bcg,this.avatar,this.avatar_frame,this.artist_name,this.card_num,this.song_name,this.bottom_line,this.lock);
		
	}
	
	async set(song_id){
			
		this.song_id=song_id;
		this.visible=true;
		this.artist_name.text=songs_data[song_id].artist_rus;
		this.song_name.text=songs_data[song_id].song_rus;
		const avatar_res=songs_data[song_id].artist_eng;
		this.avatar.texture=PIXI.Texture.WHITE;
		this.card_num.text=song_id+1;
		
		if (!avatar_loader.resources[avatar_res]){			
			avatar_loader.add(songs_data[song_id].artist_eng,'artists/'+songs_data[song_id].artist_eng+'.jpg',{timeout: 5000});			
			await new Promise(resolve=> avatar_loader.load(resolve));
		}

		this.avatar.texture=avatar_loader.resources[avatar_res].texture;	
	
	}
	
}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(game_res.resources.lb_player_card_bcg.texture);
		this.bcg.interactive=true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};
		this.bcg.width = 370;
		this.bcg.height = 70;

		this.place=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.place.tint=0xffff00;
		this.place.x=20;
		this.place.y=22;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=43;
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;


		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.name.tint=0xdddddd;
		this.name.x=105;
		this.name.y=22;


		this.rating=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating.x=298;
		this.rating.tint=0xff55ff;
		this.rating.y=22;

		this.addChild(this.bcg,this.place, this.avatar, this.name, this.rating);
	}


}

irnd = function (min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

anim2={
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0,visible:false,ready:true, alpha:0},
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	any_on : function() {
		
		for (let s of this.slot)
			if (s !== null&&s.block)
				return true
		return false;		
	},
	
	wait(seconds){		
		return this.add(this.empty_spr,{x:[0,1]}, false, seconds,'linear');		
	},
	
	linear: function(x) {
		return x
	},
	
	kill_anim: function(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj)
					this.slot[i]=null;		
	},
	
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic: function(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine: function(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad: function(x) {
		return x * x;
	},
	
	easeOutBounce: function(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	
	easeInCubic: function(x) {
		return x * x * x;
	},
	
	ease2back : function(x) {
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic: function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake : function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		
		
	},	
	
	add : function(obj,params,vis_on_end,time,func,block) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);
		/*if (anim3_origin === undefined)
			anim3.kill_anim(obj);*/

		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {

				obj.visible = true;
				obj.ready = false;
				
				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];
				}
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back')
					for (let key in params)
						params[key][1]=params[key][0];					
					
				this.slot[i] = {
					obj: obj,
					block:block===undefined,
					params: params,
					vis_on_end: vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

	},	
	
	process: function () {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed;		
				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		
				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
					
					s.obj.visible=s.vis_on_end;
					if (s.vis_on_end === false)
						s.obj.alpha = 1;
					
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	}
	
}

sound={
	
	on : 1,
	
	play : function(snd_res,res_source) {
		
		
		if(res_source===undefined)
			res_source=gres;
		
		if (this.on === 0)
			return;
		
		if (res_source[snd_res]===undefined)
			return;
		
		res_source[snd_res].sound.play();	
		
	}
	
	
}

message={
	
	promise_resolve :0,
	
	async add(text, timeout) {
		
		if (this.promise_resolve!==0)
			this.promise_resolve('forced');
		
		if (timeout === undefined) timeout = 3000;
		
		//воспроизводим звук
		sound.play('message');

		objects.message_text.text=text;

		await anim2.add(objects.message_cont,{x:[-200,objects.message_cont.sx]}, true, 0.25,'easeOutBack');

		let res = await new Promise((resolve, reject) => {
				message.promise_resolve = resolve;
				setTimeout(resolve, timeout)
			}
		);
		
		
		message.promise_resolve=0;
		if (res === "forced")
			return;

		anim2.add(objects.message_cont,{x:[objects.message_cont.sx, -200]}, false, 0.25,'easeInBack');			
	},
	
	close(){
		
		if(this.promise_resolve!==0){
			message.promise_resolve('forced');
			objects.message_cont.visible=false;
		}
			
		
	},
	
	clicked() {
		
		
		message.promise_resolve();
		
	}

}

big_message={
	
	p_resolve : 0,
		
	show: function(t1,t2, feedback_on) {
				
		if (t2!==undefined || t2!=="")
			objects.big_message_text2.text=t2;
		else
			objects.big_message_text2.text='**********';

		objects.big_message_text.text=t1;
		
		objects.feedback_button.visible = feedback_on;
		
		anim2.add(objects.big_message_cont,{y:[-180, objects.big_message_cont.sy]},true,0.4,'easeOutBack');

				
		return new Promise(function(resolve, reject){					
			big_message.p_resolve = resolve;	  		  
		});
	},

	feedback_down : async function () {
		
		if (objects.big_message_cont.ready===false || this.feedback_on === 0) {
			sound.play('locked');
			return;			
		}


		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.4,'easeInBack');	
		
		//пишем отзыв и отправляем его		
		const fb = await feedback.show(opp_data.uid);		
		if (fb[0] === 'sent') {
			const fb_id = irnd(0,50);			
			await firebase.database().ref("fb/"+opp_data.uid+"/"+fb_id).set([fb[1], firebase.database.ServerValue.TIMESTAMP, my_data.name]);
		
		}
		
		this.p_resolve("close");
				
	},

	close : function() {
		
		if (objects.big_message_cont.ready===false)
			return;

		sound.play('close');
		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.y, 450]},false,0.4,'easeInBack');
		
		this.p_resolve("close");			
	}

}

dialog={
	
	invite:false,
	share:false,
	
	show(type){		

		
		objects.dialog_no.pointerdown=function(){};
		objects.dialog_ok.pointerdown=function(){};
		
		if(type==='game_over'){
			anim2.add(objects.dialog_cont,{alpha:[0, 1]},true,0.4,'linear');	
			objects.dialog_card.texture=gres.game_over_img.texture;		
			objects.dialog_no.visible=true;
			objects.dialog_ok.visible=true;
			objects.dialog_ok.pointerdown=function(){
				if(anim2.any_on())return;
				dialog.close();				
				game.restart();

			};
			objects.dialog_no.pointerdown=function(){
				if(anim2.any_on())return;
				dialog.close();				
				game.exit();

			};
		}
		
		if(type==='rules'){
			anim2.add(objects.dialog_cont,{alpha:[0, 1]},true,0.4,'linear');	
			objects.dialog_card.texture=gres.rules_img.texture;		
			objects.dialog_no.visible=false;
			objects.dialog_ok.visible=true;
			objects.dialog_ok.pointerdown=function(){
				if(anim2.any_on())return;
				sound.play('click');
				dialog.close();					
				objects.dialog_card.resolver();
			};
			
			return new Promise(resolver=>{				
				objects.dialog_card.resolver=resolver;			
			})
		}
		
		if(type==='ad_break'){
			anim2.add(objects.dialog_cont,{alpha:[0, 1]},true,0.4,'linear');	
			objects.dialog_card.texture=gres.ad_break_img.texture;	
			objects.dialog_no.visible=false;
			objects.dialog_ok.visible=false;
			setTimeout(function(){dialog.close()},3000);
		}
		
		if(type==='share'){
			if(this.share) return;			
			this.share=true;
			anim2.add(objects.dialog_cont,{alpha:[0, 1]},true,0.4,'linear');	
			objects.dialog_card.texture=gres.share_img.texture;	
			objects.dialog_card.resolver=function(){};
			objects.dialog_no.visible=true;
			objects.dialog_ok.visible=true;
			
			objects.dialog_ok.pointerdown=function(){
				if(anim2.any_on())return;
				dialog.close();		
				sound.play('click');
				objects.dialog_card.resolver();

			};
			objects.dialog_no.pointerdown=function(){
				if(anim2.any_on())return;
				dialog.close();	
				sound.play('click');
				bridge.send('VKWebAppShowWallPostBox', { message: 'Я играю в Пианиста и мне нравится!'})
				objects.dialog_card.resolver();

			};
			return new Promise(resolver=>{				
				objects.dialog_card.resolver=resolver;			
			})
		}
			
		if(type==='invite_friends'){
			if(this.invite) return;
			this.invite=true;
			anim2.add(objects.dialog_cont,{alpha:[0, 1]},true,0.4,'linear');	
			objects.dialog_card.texture=gres.invite_friends_img.texture;	
			objects.dialog_card.resolver=function(){};
			objects.dialog_no.visible=true;
			objects.dialog_ok.visible=true;
			
			objects.dialog_ok.pointerdown=function(){
				if(anim2.any_on())return;
				dialog.close();	
				sound.play('click');
				vkBridge.send('VKWebAppShowInviteBox');
				objects.dialog_card.resolver();

			};
			objects.dialog_no.pointerdown=function(){
				if(anim2.any_on())return;
				dialog.close();	
				sound.play('click');
				objects.dialog_card.resolver();

			};
			return new Promise(resolver=>{				
				objects.dialog_card.resolver=resolver;			
			})
		}
		
		
	},
	
	close(){
		
		anim2.add(objects.dialog_cont,{alpha:[1, 0]},false,0.3,'linear');	
		
	}
	
	
}

board_func={

	checker_to_move: "",
	target_point: 0,
	tex_2:0,
	tex_1:0,
	moves: [],
	move_end_callback: function(){},

	update_board: function() {

		//сначала скрываем все шашки
		objects.figures.forEach((c)=>{	c.visible=false});

		var i=0;
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {

				const piece = g_board[y][x];
				if (piece==='x') continue
				
				const is_my_piece = my_pieces.includes(piece);
				const piece_texture_name=[board.op_color,board.my_color][+is_my_piece]+piece.toLowerCase();
												
				objects.figures[i].texture = gres[piece_texture_name].texture;

				objects.figures[i].x = x * 50 + objects.board.x + 20;
				objects.figures[i].y = y * 50 + objects.board.y + 10;

				objects.figures[i].ix = x;
				objects.figures[i].iy = y;
				objects.figures[i].piece = piece;
				objects.figures[i].alpha = 1;

				objects.figures[i].visible = true;
				i++;
			}
		}

	},
	
	get_fen : function(brd) {
		
		let fen = "";
		
		for (var y = 0; y < 8; y++) {	
			
			let prv_f = '';
			let cnt_e = 0;
			
			for (var x = 0; x < 8; x++) {
				
				if (brd[y][x]==='x')				
					cnt_e ++;
					
				if (brd[y][x] !=='x') {
					
					if (cnt_e > 0 ) {
						fen = fen + cnt_e;
						cnt_e = 0;
					}

					fen = fen + brd[y][x]
				}
				
				if ( x === 7 && cnt_e > 0)					
					fen = fen + cnt_e;
			}
			
			if (y !== 7)
				fen = fen + '/';
		}	
		
		return fen;
		
	},

	fen_to_board(fen){
		
		const rows = fen.split(' ')[0].split('/');
		const board = [];

		for (let i = 0; i < 8; i++) {
			const row = rows[i];
			const boardRow = [];

			for (let j = 0; j < row.length; j++) {
				const char = row[j];

				if (isNaN(char)) {
					boardRow.push(char);
				} else {
					for (let k = 0; k < parseInt(char); k++) {
					boardRow.push('x');
					}
				}
			}

			board.push(boardRow);
		}

		return board;		
	},

	get_checker_by_pos(x,y) {

		for (let c of objects.figures)
			if (c.visible===true&&c.ix===x&&c.iy===y)
				return c;
		return 0;
	},
	
	get_moves_on_dir (brd, f, dx, dy, max_moves, figures_to_eat) {
				
		//текущее положение
		const cx = f.ix;
		const cy = f.iy;
		let valid_moves = [];

		for (let i = 1 ; i < max_moves; i++) {
			
			let tx = cx + i * dx;
			let ty = cy + i * dy;
			
			if ( tx > -1 && tx < 8 && ty > -1 && ty < 8 ) {
				if (brd[ty][tx] === 'x') {
					valid_moves.push(tx+'_'+ty)						
				} else {						
					if (figures_to_eat.includes(brd[ty][tx]) === true)
						valid_moves.push(tx+'_'+ty)
					break;
				}							
			}	
		}
		
		return valid_moves;
		
	},
	
	get_figure_pos(brd, f_name) {		
		
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {

				let t = brd[y][x];
				if (t===f_name)
					return [x,y];
			}
		}	
	},
	
	get_valid_moves(brd, f, figures_to_eat) {
		
		let valid_moves =[];
		
		//создаем массив возможных ходов
		if (f.piece === 'P' || f.piece === 'p') {
							
			const dy =  f.piece === 'p' ? 1 : -1;
			
			//проверяем возможность хода вперед на одну клетку
			const cx = f.ix;
			const cy = f.iy;
			let tx = cx;
			let ty = cy + dy;				
			if (ty > -1 && ty < 8)
				if (brd[ty][tx] === 'x')				
					valid_moves.push(tx+'_'+ty)
			
			//проверяем возможность хода вперед на две клетки
			const iy =  f.piece === 'p' ? 1 : 6;
			tx = cx;
			ty = cy + dy + dy;				
			if (ty > -1 && ty < 8  && cy === iy)
				if (brd[ty][tx] === 'x' && brd[ty+1][tx] === 'x')				
					valid_moves.push(tx+'_'+ty)

			//проверяем возможность есть влево
			tx = cx - 1;
			ty = cy + dy;				
			if (ty > -1 && ty < 8 && tx > -1)
				if (figures_to_eat.includes(brd[ty][tx])  === true)				
					valid_moves.push(tx+'_'+ty)			
			
			//проверяем возможность есть вправо
			tx = cx + 1;
			ty = cy + dy;				
			if (ty > -1 && ty < 8 && tx < 8)
				if (figures_to_eat.includes(brd[ty][tx])  === true)				
					valid_moves.push(tx+'_'+ty)
							
			
			//проверяем возможность взятия пешки на проходе
			if (f.piece === 'P' && f.iy === 3 && board.pass_take_flag !== -1) {
				
				tx = cx - 1;
				if (tx === board.pass_take_flag)
					valid_moves.push(tx+'_'+2);				
				
				tx = cx + 1;
				if (tx === board.pass_take_flag)
					valid_moves.push(tx+'_'+2);				
			}
			
				
			return valid_moves;
			
		}
		
		if (f.piece === 'R' || f.piece === 'r') {
			
			//текущее положение
			const cx = f.ix;
			const cy = f.iy;
			
			const m0 = this.get_moves_on_dir(brd,f, -1 , 0, 8, figures_to_eat);
			const m1 = this.get_moves_on_dir(brd,f, 1 , 0, 8, figures_to_eat);
			const m2 = this.get_moves_on_dir(brd,f, 0 , -1, 8, figures_to_eat);
			const m3 = this.get_moves_on_dir(brd,f, 0 , 1, 8, figures_to_eat);
			
			return [...m0,...m1,...m2,...m3];
			
		}
		
		if (f.piece === 'N' || f.piece === 'n') {
			
			//направления ходов коня [dx,dy]]
			let moves_dir = [[-2,-1],[-1,-2],[1,-2],[2,-1],[2,1],[1,2],[-1,2],[-2,1]];
			for ( let v = 0 ; v < 8 ; v++ ) {
				const tx = f.ix + moves_dir[v][0];
				const ty = f.iy + moves_dir[v][1];
				
				//заносим в перечень валадных ходов
				if ( tx > -1 && tx < 8 && ty > -1 && ty < 8) {
					
					if (brd[ty][tx] === 'x') {
						valid_moves.push(tx+'_'+ty)						
					} else {						
						if (figures_to_eat.includes(brd[ty][tx]) === true)
							valid_moves.push(tx+'_'+ty)
					}
				}		
			}
			
			return valid_moves;				
		}
		
		if (f.piece === 'B' || f.piece === 'b') {
			
			//текущее положение
			const cx = f.ix;
			const cy = f.iy;
			
			const m0 = this.get_moves_on_dir(brd,f, -1 , -1, 8, figures_to_eat);
			const m1 = this.get_moves_on_dir(brd,f, -1 , 1, 8, figures_to_eat);
			const m2 = this.get_moves_on_dir(brd,f, 1 , -1, 8, figures_to_eat);
			const m3 = this.get_moves_on_dir(brd,f, 1 , 1, 8, figures_to_eat);
			
			return [...m0,...m1,...m2,...m3];		
		
		}
		
		if (f.piece === 'K' || f.piece === 'k') {
			
			
			const m0 = this.get_moves_on_dir(brd,f, -1 , -1, 2, figures_to_eat);
			const m1 = this.get_moves_on_dir(brd,f, -1 , 1, 2, figures_to_eat);
			const m2 = this.get_moves_on_dir(brd,f, 1 , -1, 2, figures_to_eat);
			const m3 = this.get_moves_on_dir(brd,f, 1 , 1, 2, figures_to_eat);
			const m4 = this.get_moves_on_dir(brd,f, -1 , 0, 2, figures_to_eat);
			const m5 = this.get_moves_on_dir(brd,f, 1 , 0, 2, figures_to_eat);
			const m6 = this.get_moves_on_dir(brd,f, 0 , -1, 2, figures_to_eat);
			const m7 = this.get_moves_on_dir(brd,f, 0 , 1, 2, figures_to_eat);
			
			return [...m0,...m1,...m2,...m3,...m4,...m5,...m6,...m7];	
			
		}
		
		if (f.piece === 'Q' || f.piece === 'q') {
			
			//текущее положение
			const cx = f.ix;
			const cy = f.iy;
			
			const m0 = this.get_moves_on_dir(brd,f, -1 , -1, 8, figures_to_eat);
			const m1 = this.get_moves_on_dir(brd,f, -1 , 1, 8, figures_to_eat);
			const m2 = this.get_moves_on_dir(brd,f, 1 , -1, 8, figures_to_eat);
			const m3 = this.get_moves_on_dir(brd,f, 1 , 1, 8, figures_to_eat);
			const m4 = this.get_moves_on_dir(brd,f, -1 , 0, 8, figures_to_eat);
			const m5 = this.get_moves_on_dir(brd,f, 1 , 0, 8, figures_to_eat);
			const m6 = this.get_moves_on_dir(brd,f, 0 , -1, 8, figures_to_eat);
			const m7 = this.get_moves_on_dir(brd,f, 0 , 1, 8, figures_to_eat);
			
			return [...m0,...m1,...m2,...m3,...m4,...m5,...m6,...m7];		
			
		}

	},
	
	is_check(brd, king) {
		
		if (king === 'k') {
			
			//положение короля
			let king_pos = board_func.get_figure_pos(brd, king);
			king_pos = king_pos[0] + '_' + king_pos[1];
			
			//проверяем все фигуры - есть ли у них возможность есть короля
			for (var x = 0; x < 8; x++) {
				for (var y = 0; y < 8; y++) {				
					if(my_pieces.includes(brd[y][x])) {
						
						let f = {ix:x, iy:y, piece : brd[y][x]};
						let v_moves = board_func.get_valid_moves(brd, f, op_pieces);						
						if (v_moves.includes(king_pos) === true)
							return true;									
						
					}				
				}
			}	
			return false;
		}
		
		if (king === 'K') {
			
			//положение короля
			let king_pos = board_func.get_figure_pos(brd, king);
			king_pos = king_pos[0] + '_' + king_pos[1];
			
			//проверяем все фигуры - есть ли у них возможность есть короля
			for (var x = 0; x < 8; x++) {
				for (var y = 0; y < 8; y++) {				
					if(op_pieces.includes(brd[y][x])) {
						
						let f = {ix:x, iy:y, piece : brd[y][x]};
						let v_moves = board_func.get_valid_moves(brd, f, my_pieces);						
						if (v_moves.includes(king_pos) === true)
							return true;									
						
					}				
				}
			}	
			
			return false;
		}
		
	},

	check_fin(brd, piece) {
		
		//проверяем звершение игры
		let fen = board_func.get_fen(brd) + ' ' + piece + ' - - 1 1';
		chess.load(fen);
		let is_check = chess.in_check();
		let is_checkmate =  chess.in_checkmate();	
		let	is_stalemate = chess.in_stalemate();
				
		if (is_checkmate === true)
			return 'checkmate';		
		if (is_stalemate === true)
			return 'stalemate';		
		if (is_check === true)
			return 'check';
		return '';
	}
}

make_text=function (obj, text, max_width) {

	let sum_v=0;
	let f_size=obj.fontSize;

	for (let i=0;i<text.length;i++) {

		let code_id=text.charCodeAt(i);
		let char_obj=game_res.resources.m2_font.bitmapFont.chars[code_id];
		if (char_obj===undefined) {
			char_obj=game_res.resources.m2_font.bitmapFont.chars[83];
			text = text.substring(0, i) + 'S' + text.substring(i + 1);
		}

		sum_v+=char_obj.xAdvance*f_size/64;
		if (sum_v>max_width) {
			obj.text =  text.substring(0,i-1);
			return;
		}
	}

	obj.text =  text;
}

game={	
	
	midi_number_to_name:{21:'A0',22:'Bb0',23:'B0',24:'C1',25:'Db1',26:'D1',27:'Eb1',28:'E1',29:'F1',30:'Gb1',31:'G1',32:'Ab1',33:'A1',34:'Bb1',35:'B1',36:'C2',37:'Db2',38:'D2',39:'Eb2',40:'E2',41:'F2',42:'Gb2',43:'G2',44:'Ab2',45:'A2',46:'Bb2',47:'B2',48:'C3',49:'Db3',50:'D3',51:'Eb3',52:'E3',53:'F3',54:'Gb3',55:'G3',56:'Ab3',57:'A3',58:'Bb3',59:'B3',60:'C4',61:'Db4',62:'D4',63:'Eb4',64:'E4',65:'F4',66:'Gb4',67:'G4',68:'Ab4',69:'A4',70:'Bb4',71:'B4',72:'C5',73:'Db5',74:'D5',75:'Eb5',76:'E5',77:'F5',78:'Gb5',79:'G5',80:'Ab5',81:'A5',82:'Bb5',83:'B5',84:'C6',85:'Db6',86:'D6',87:'Eb6',88:'E6',89:'F6',90:'Gb6',91:'G6',92:'Ab6',93:'A6',94:'Bb6',95:'B6',96:'C7',97:'Db7',98:'D7',99:'Eb7',100:'E7',101:'F7',102:'Gb7',103:'G7',104:'Ab7',105:'A7',106:'Bb7',107:'B7',108:'C8'},
	main_notes:[],
	bass_notes:[],	
	all_notes:[],
	song_id:0,
	notes_loader:null,
	audio_buffers :[],
	play_start:0,
	life:3,
	on:false,
	notes_in_song:0,
	touches_cnt:0,
	
	async activate() {		
				
		objects.load_notice.visible=true;
		const midi_file_id=songs_data[play_menu.cur_song_id].file_name;
		speed=songs_data[play_menu.cur_song_id].speed;
		const midi = await Midi.fromUrl(git_src+'/new_midi/'+midi_file_id+'.mid');
		
		let unique_notes={};
		let all_unique_notes={};
		
		//жизни
		this.life=5;
		if(play_menu.cur_song_id>5)
			this.life=4;
		if(play_menu.cur_song_id>10)
			this.life=3;
		if(play_menu.cur_song_id>15)
			this.life=2;
		if(play_menu.cur_song_id>20)
			this.life=1;
		
		for (let i=0;i<5;i++){
			if (i<this.life)
				objects.hearts[i].texture=gres.heart_img.texture;
			else
				objects.hearts[i].texture=gres.no_heart_img.texture;
		}
		anim2.add(objects.hearts_cont,{y:[-60, objects.hearts_cont.sy]},true,0.4,'linear');
		
		//определяем уникальные ноты чтобы только их загрузить (они загрузятся в объект по возрастанию)
		this.main_notes=midi.tracks.filter(t => t.name==='MAIN')[0].notes;
		this.bass_notes=midi.tracks.filter(t => t.name==='BASS')[0].notes;
		this.main_notes.forEach(n=>n.track='MAIN');
		this.bass_notes.forEach(n=>n.track='BASS');
		
		this.all_notes=[...this.main_notes,...this.bass_notes];
		for(let note of this.all_notes) note.played=false;
		for(let note of this.main_notes) {unique_notes[note.midi]=note.midi;note.catched=false;note.finished=false};		
		for(let note of this.all_notes) all_unique_notes[note.midi]=note.midi;		
		
		//считаем сколько нот в песне
		this.notes_in_song=this.main_notes.length+5;
		objects.taps_left.text=game.notes_in_song;
		
		//считаем количество нот
		const unique_notes_arr=Object.keys(unique_notes);
		const unique_notes_num=unique_notes_arr.length;	
		
		//располагаем клавиши на экране
		const piano_key_width=800/unique_notes_num;
		objects.piano_keys.forEach(key=>key.visible=false);
		for(let k=0;k<unique_notes_num;k++){
			objects.piano_keys[k].texture=gres['piano_key'+unique_notes_num].texture;
			objects.piano_keys[k].visible=true;
			
			objects.piano_keys[k].width=piano_key_width;
			objects.piano_keys[k].height=210;
			objects.piano_keys[k].x=k*piano_key_width;		
			objects.piano_keys[k].midi=+unique_notes_arr[k];	
		}
		
		//это подсветка нажатой клавиши
		objects.piano_key_press.width=piano_key_width;
		
		//добавляем порядок ноты по возрастанию
		let ind = 0;
		for (key in unique_notes)		
			unique_notes[key] = ind++;

		//определяем время первой ноты
		const first_note_time=this.main_notes[0].time;

		//начальное расположение падающих нот
		objects.falling_notes.forEach(f=>f.visible=false)
		for(let k=0;k<this.main_notes.length;k++){
			const note_midi = this.main_notes[k].midi;
			const note_time = this.main_notes[k].time;	
			anim2.kill_anim(objects.falling_notes[k]);
			objects.falling_notes[k].time=note_time;
			objects.falling_notes[k].x=unique_notes[note_midi]*piano_key_width+piano_key_width*0.5;
			//objects.falling_notes[k].y=300+first_note_time*50-note_time*(50);
			objects.falling_notes[k].visible=true;
			objects.falling_notes[k].width=50;
			objects.falling_notes[k].height=50;
			objects.falling_notes[k].alpha=1;
			objects.falling_notes[k].tint=0xffffff;	
			objects.falling_notes[k].texture=gres.falling_note_img.texture;
		}		
		
		
		//подгружаем ноты которые будут играть и звучать
		if(this.notes_loader===null)
			this.notes_loader=new PIXI.Loader();
		for (let note of Object.keys(all_unique_notes)){
			if (this.notes_loader.resources['M'+note]===undefined)
				this.notes_loader.add('M'+note,'acoustic_grand_piano/'+this.midi_number_to_name[note]+'.mp3');			
			
		}

		
		await new Promise(resolve=>this.notes_loader.load(resolve));
		objects.load_notice.visible=false;
		
		anim2.add(objects.piano_keys_cont,{y:[600, 0]}, true, 0.5,'easeOutCubic');
		objects.falling_notes_cont.visible=true;
		anim2.add(objects.hand_icon,{y:[-200, objects.hand_icon.sy]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.taps_left,{y:[-200, objects.taps_left.sy]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.close_button,{y:[-200, objects.close_button.sy]}, true, 0.5,'easeOutCubic');
		
		
		//показываем инструкцию для новичков
		if(my_data.rating===0)
			await dialog.show('rules');			


		
		//3 доп секунды до первой ноты
		this.play_start=game_tick-first_note_time/speed+3;
		this.on=true;
		some_process.game=this.process.bind(game);
	},
	
	async restart(){
		
		sound.play('click');
		
		//время рекламы
		await ad.check_and_show();
		
		game.activate();		
	},
	
	exit_down(){
		if(anim2.any_on())return;
		this.exit();
		
	},
	
	exit(){
		sound.play('click');
		this.close();
		play_menu.activate();
		
	},
	
	next(){
		
		some_process.game=function(){};
		this.song_id++;
		game.activate();
		
	},
	
	play_note(midi_number,duration){
		
		//это источник звука
		var source = audio_context.createBufferSource();
		
		source.buffer = this.notes_loader.resources[midi_number].sound.media.buffer;			
		source.connect(audio_context.destination);			
					
		/*source.gainNode = audio_context.createGain();
		source.gainNode.connect(audio_context.destination);		
		var gain = source.gainNode.gain;
		gain.value = 1;
		source.connect(source.gainNode);
		
		game.audio_buffers.push(source);
		
		gain.linearRampToValueAtTime(gain.value, audio_context.currentTime);
		gain.linearRampToValueAtTime(-1.0, audio_context.currentTime + duration + 1);*/		

		source.start(audio_context.currentTime, 0,  duration+ 1.2);		
		setTimeout(() => {
		  // Start playing the audio for the second time
		  source.start();
		}, 3000);
	},
	
	touch_down(){
		
		if(!game.on) return;
		
		const cur_sec=(game_tick-game.play_start)*speed;
		
		objects.piano_key_press.x=this.x;
		anim2.add(objects.piano_key_press,{alpha:[1, 0]},false,1,'linear',false);
		//game.play_note('M'+this.midi,1);
		sound.play('M'+this.midi,game.notes_loader.resources)
		
		let good=false;			
		let close_notes={};
		for(let k=0;k<game.main_notes.length;k++){
			const note = game.main_notes[k];
			const note_time = note.time;
			const note_midi = note.midi;
			const d=Math.abs(note_time-cur_sec);
			if(note.catched===false&&note_midi===this.midi&&d<0.25)
				close_notes[k]=d;
		}	
		
		//если нажали какую-то ноту близкую
		if (Object.keys(close_notes).length>0) {
			let min_note_ind = Object.keys(close_notes).reduce((key, v) => close_notes[v] < close_notes[key] ? v : key);			
			
			game.main_notes[+min_note_ind].catched=true;
			game.main_notes[+min_note_ind].finished=true;
			const snote=objects.falling_notes[+min_note_ind];
			snote.texture=gres.falling_note_ok_img.texture;
			
			anim2.add(snote,{scale_xy:[snote.scale_xy, snote.scale_xy*2],alpha:[1,0]},false,2,'linear',false);
		}else{
			sound.play('locked');
		}
		
		
		game.notes_in_song--;
		objects.taps_left.text=game.notes_in_song;
		
		if(game.notes_in_song===0)
			game.stop();

		
		
	},
	
	async wait_instructions(){
		
		objects.instructions.visible=true;
		await new Promise(resolver=>{			
			objects.instructions.resolver=resolver;
		})
		objects.instructions.visible=false;
		
	},
		
	stop(){
		
		this.on=false;
		sound.play('crowd_whoo');
		dialog.show('game_over');		
		some_process.game=function(){};
	},
	
	close(){
		
		some_process.game=function(){};
		objects.piano_keys_cont.visible=false;
		objects.falling_notes_cont.visible=false;
		objects.hand_icon.visible=false;
		objects.hearts_cont.visible=false;
		objects.taps_left.visible=false;
		objects.close_button.visible=false;
		this.on=false;
	},
	
	decrease_life(){
		

		this.life--;
		objects.hearts[this.life].texture=gres.no_heart_img.texture;
		sound.play('locked');
		if(this.life===0) game.stop();
	},
	
	key_down(e){
		

	},
			
	process(){
		
		
		const cur_sec=(game_tick-this.play_start)*speed;
		
		
		//это басы
		for(let k=0;k<this.bass_notes.length;k++){

			const note = this.bass_notes[k];
			const note_time = note.time;
			const note_midi = note.midi;
			const dt=note_time-cur_sec;
			const pos_y=300-dt*100;			
			if(pos_y>=300 && note.played===false){				
				sound.play('M'+note_midi,this.notes_loader.resources);					
				note.played=true;					
			}
		}	

		//это основные ноты
		let no_notes=true;
		for(let k=0;k<this.main_notes.length;k++){

			const note = this.main_notes[k];
			const note_time = note.time;
			const dt=note_time-cur_sec;
			const pos_y=300-dt*100;

			const sprite_note=objects.falling_notes[k];
			if(pos_y>300&&sprite_note.y<=300) sprite_note.tint=0xff0000;			
			
			
			if(dt<-0.25&&!note.finished) {
				
				if (note.catched){
					
					
				} else {
					game.decrease_life();
					sprite_note.texture=gres.falling_note_no_img.texture;	
					anim2.add(sprite_note,{scale_xy:[sprite_note.scale_xy, sprite_note.scale_xy*2],alpha:[1,0]},false,2,'linear',false);
				}
				note.finished=true;
			}
			
			if(dt>-3)
				no_notes=false;

			sprite_note.y=pos_y;			
		}	
		
		if(no_notes){
			sound.play('applause');			
			this.close();			
			play_menu.activate('win');			
		}
		
	}

}

keep_alive=function() {
	
	firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);

}

ad={
	
	prv_show : Date.now(),
		
	async check_and_show(){
		
		if ((Date.now() - this.prv_show) < 90000 )
			return false;
		this.prv_show = Date.now();
		
		this.show();
		dialog.show('ad_break');
	},
	
	show() {
				
		if (game_platform==="YANDEX") {			
			//показываем рекламу
			window.ysdk.adv.showFullscreenAdv({
			  callbacks: {
				onClose: function() {}, 
				onError: function() {}
						}
			})
		}
		
		if (game_platform==="VK") {
					 
			vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
			.then(data => console.log(data.result))
			.catch(error => console.log(error));	
		}		

		if (game_platform==="MY_GAMES") {
					 
			my_games_api.showAds({interstitial:true});
		}			
		
		if (game_platform==='GOOGLE_PLAY') {
			if (typeof Android !== 'undefined') {
				Android.showAdFromJs();
			}			
		}
		
		
	},
	
	show2 : async function() {
		
		
		if (game_platform ==="YANDEX") {
			
			let res = await new Promise(function(resolve, reject){				
				window.ysdk.adv.showRewardedVideo({
						callbacks: {
						  onOpen: () => {},
						  onRewarded: () => {resolve('ok')},
						  onClose: () => {resolve('err')}, 
						  onError: (e) => {resolve('err')}
					}
				})
			
			})
			return res;
		}
		
		if (game_platform === "VK") {	

			let res = '';
			try {
				res = await vkBridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
			}
			catch(error) {
				res ='err';
			}
			
			return res;				
			
		}	
		
		return 'err';
		
	}
}

lb={

	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],

	show: function() {

		objects.bcg.texture=game_res.resources.lb_bcg.texture;

		anim2.add(objects.lb_1_cont,{x:[-150,objects.lb_1_cont.sx]},true,0.4,'easeOutBack');
		anim2.add(objects.lb_2_cont,{x:[-150,objects.lb_2_cont.sx]},true,0.45,'easeOutBack');
		anim2.add(objects.lb_3_cont,{x:[-150,objects.lb_3_cont.sx]},true,0.5,'easeOutBack');
		anim2.add(objects.lb_cards_cont,{x:[450,0]},true,0.5,'easeOutCubic');
		
		

		objects.lb_cards_cont.visible=true;
		objects.lb_back_button.visible=true;

		for (let i=0;i<7;i++) {
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];
			objects.lb_cards[i].place.text=(i+4)+".";

		}


		this.update();

	},

	close: function() {

		objects.bcg.texture=game_res.resources.bcg.texture;
		objects.lb_1_cont.visible=false;
		objects.lb_2_cont.visible=false;
		objects.lb_3_cont.visible=false;
		objects.lb_cards_cont.visible=false;
		objects.lb_back_button.visible=false;

	},

	back_button_down: function() {

		if (any_dialog_active===1 || objects.lb_1_cont.ready===false) {
			sound.play('locked');
			return
		};


		sound.play('click');
		this.close();
		main_menu.activate();

	},

	update: function () {

		firebase.database().ref("players").orderByChild('rating').limitToLast(25).once('value').then((snapshot) => {

			if (snapshot.val()===null) {
			  //console.log("Что-то не получилось получить данные о рейтингах");
			}
			else {

				var players_array = [];
				snapshot.forEach(players_data=> {
					if (players_data.val().name!=="" && players_data.val().name!=='' && players_data.val().name!==undefined)
						players_array.push([players_data.val().name, players_data.val().rating, players_data.val().pic_url]);
				});


				players_array.sort(function(a, b) {	return b[1] - a[1];});

				//создаем загрузчик топа
				var loader = new PIXI.Loader();

				var len=Math.min(10,players_array.length);

				//загружаем тройку лучших
				for (let i=0;i<3;i++) {
					
					if (i >= len) break;		
					if (players_array[i][0] === undefined) break;	
					
					let fname = players_array[i][0];
					make_text(objects['lb_'+(i+1)+'_name'],fname,180);					
					objects['lb_'+(i+1)+'_rating'].text=players_array[i][1];
					loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 3000});
				};

				//загружаем остальных
				for (let i=3;i<10;i++) {
					
					if (i >= len) break;	
					if (players_array[i][0] === undefined) break;	
					
					let fname=players_array[i][0];

					make_text(objects.lb_cards[i-3].name,fname,180);

					objects.lb_cards[i-3].rating.text=players_array[i][1];
					loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});
				};

				loader.load();

				//показываем аватар как только он загрузился
				loader.onProgress.add((loader, resource) => {
					let lb_num=Number(resource.name.slice(-1));
					if (lb_num<3)
						objects['lb_'+(lb_num+1)+'_avatar'].texture=resource.texture
					else
						objects.lb_cards[lb_num-3].avatar.texture=resource.texture;
				});

			}

		});

	}

}

auth2 = {
		
	load_script : function(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
			
	get_random_char : function() {		
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[irnd(0,chars.length-1)];
		
	},
	
	get_random_uid_for_local : function(prefix) {
		
		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();
		
		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('poker_uid', uid);
		} catch (e) {alert(e)}
					
		return uid;
		
	},
	
	get_random_name : function(uid) {
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const rnd_names = ['Gamma','Chime','Dron','Perl','Onyx','Asti','Wolf','Roll','Lime','Cosy','Hot','Kent','Pony','Baker','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
		
		if (uid !== undefined) {
			
			let e_num1 = chars.indexOf(uid[3]) + chars.indexOf(uid[4]) + chars.indexOf(uid[5]) + chars.indexOf(uid[6]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);				
			let name_postfix = chars.indexOf(uid[7]).toString() + chars.indexOf(uid[8]).toString() + chars.indexOf(uid[9]).toString() ;	
			return rnd_names[e_num1] + name_postfix.substring(0, 3);					
			
		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;				
			return name;
		}	
	},	
	
	get_country_code : async function() {
		
		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json");
			let resp2 = await resp1.json();			
			country_code = resp2.country;			
		} catch(e){}

		return country_code;
		
	},
	
	search_in_local_storage : function() {
		
		//ищем в локальном хранилище
		let local_uid = null;
		
		try {
			local_uid = localStorage.getItem('poker_uid');
		} catch (e) {alert(e)}
				
		if (local_uid !== null) return local_uid;
		
		return undefined;	
		
	},
	
	init : async function() {	
				
		if (game_platform === 'YANDEX') {			
		
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};										
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();
			my_data.pic_url = _player.getPhoto('medium');
			
			if (my_data.pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';
			
			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);
			
			//если английский яндекс до добавляем к имени страну
			let country_code = await this.get_country_code();
			my_data.name = my_data.name + ' (' + country_code + ')';			


			
			return;
		}
		
		if (game_platform === 'VK') {
			
			try {await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};

			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= "vk"+_player.id;
			my_data.pic_url = _player.photo_100;
			
			return;
			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	

			let country_code = await this.get_country_code();
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			return;
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';		
			return;
		}
		
		if (game_platform === 'CRAZYGAMES') {
			
			let country_code = await this.get_country_code();
			try {await this.load_script('https://sdk.crazygames.com/crazygames-sdk-v1.js')} catch (e) {alert(e)};			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('CG_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			let crazysdk = window.CrazyGames.CrazySDK.getInstance();
			crazysdk.init();			
			return;
		}
		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			//alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
		}
	}
	
}

resize=function() {
    const vpw = window.innerWidth;  // Width of the viewport
    const vph = window.innerHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    app.renderer.resize(nvw, nvh);
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
}

vis_change=function() {

		
}

async function load_resources() {
	
	document.getElementById("m_progress").style.display = 'flex';

	git_src="https://akukamil.github.io/piano/"
	//git_src=""

	//подпапка с ресурсами
	let lang_pack = ['RUS','ENG'][0];

	game_res=new PIXI.Loader();
	game_res.add("m2_font", git_src+"fonts/Neucha/font.fnt");
	
    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++)
        if (load_list[i].class === "sprite" || load_list[i].class === "image" )
            game_res.add(load_list[i].name, git_src+'res/'+lang_pack+'/'+load_list[i].name+"."+load_list[i].image_format);	


	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('locked2',git_src+'sounds/locked2.mp3');
	game_res.add('applause',git_src+'sounds/applause.mp3');
	game_res.add('up',git_src+'sounds/up.mp3');
	game_res.add('arrow_end',git_src+'sounds/arrow_end.mp3');
	game_res.add('start',git_src+'sounds/start.mp3');
	game_res.add('note1',git_src+'sounds/note1.mp3');
	game_res.add('crowd_whoo',git_src+'sounds/crowd_whoo.mp3');	
	
	game_res.onProgress.add(progress);
	function progress(loader, resource) {
		document.getElementById("m_bar").style.width =  Math.round(loader.progress)+"%";
	}
	
	//короткое обращение к ресурсам
	gres=game_res.resources;
	
	await new Promise((resolve, reject)=> game_res.load(resolve))
	
	//убираем элементы загрузки
	document.getElementById("m_progress").outerHTML = "";	
}

language_dialog = {
	
	p_resolve : {},
	
	show : function() {
				
		return new Promise(function(resolve, reject){


			document.body.innerHTML='<style>		html,		body {		margin: 0;		padding: 0;		height: 100%;	}		body {		display: flex;		align-items: center;		justify-content: center;		background-color: rgba(24,24,64,1);		flex-direction: column	}		.two_buttons_area {	  width: 70%;	  height: 50%;	  margin: 20px 20px 0px 20px;	  display: flex;	  flex-direction: row;	}		.button {		margin: 5px 5px 5px 5px;		width: 50%;		height: 100%;		color:white;		display: block;		background-color: rgba(44,55,100,1);		font-size: 10vw;		padding: 0px;	}  	#m_progress {	  background: rgba(11,255,255,0.1);	  justify-content: flex-start;	  border-radius: 100px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 10px 40px -10px #fff;	  border-radius: 100px;	  background: #fff;	  height: 70%;	  width: 0%;	}	</style><div id ="two_buttons" class="two_buttons_area">	<button class="button" id ="but_ref1" onclick="language_dialog.p_resolve(0)">RUS</button>	<button class="button" id ="but_ref2"  onclick="language_dialog.p_resolve(1)">ENG</button></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
			language_dialog.p_resolve = resolve;	
						
		})
		
	}
	
}

main_menu={
	
	activate(){
		
		sound.play('start');
		anim2.add(objects.game_title,{y:[-100, objects.game_title.sy],alpha:[0,1]}, true, 1,'linear',false);
		anim2.add(objects.play_button,{x:[-300, objects.play_button.sx],alpha:[0,1]}, true, 1,'linear',false);
		anim2.add(objects.lb_button,{x:[900, objects.lb_button.sx],alpha:[0,1]}, true, 1,'linear',false);
		anim2.add(objects.rules_button,{y:[500, objects.rules_button.sy],alpha:[0,1]}, true, 1,'linear',false);
		
	},
	
	play_button_down(){
		if(anim2.any_on())return;
		sound.play('click');
		this.close();
		play_menu.activate();
		
	},
	
	async rules_button_down(){
		if(anim2.any_on())return;
		await game.wait_instructions();
		
	},
	
	lb_down(){
		
		if(anim2.any_on())return;
		this.close();
		lb.show();
		
		
	},
		
	close(){
		
		anim2.add(objects.game_title,{y:[objects.game_title.sy,-100]}, false, 1,'linear',false);
		anim2.add(objects.play_button,{x:[objects.play_button.sx,-300]}, false, 1,'linear',false);
		anim2.add(objects.lb_button,{x:[objects.lb_button.sx,900]}, false, 1,'linear',false);
		anim2.add(objects.rules_button,{y:[objects.rules_button.sy,500]}, false, 1,'linear',false);
		
	}
	
	
}

play_menu={
	
	song_to_play:0,
	top_card:null,
	bottom_card:null,
	cur_song_id:3,
	
	async activate(result){
		

		await this.check_vk_dialog();
		
		//время рекламы
		await ad.check_and_show();
		
		//this.cur_song_id=my_data.rating;
		
		if(!avatar_loader)
			avatar_loader=new PIXI.Loader();
				
		const cards_num=objects.songs_cards.length;
		
		//загружаем первые аватары
		for (i=0;i<cards_num;i++)			
			if (!avatar_loader.resources[songs_data[i].artist_eng])
				avatar_loader.add(songs_data[i].artist_eng,'artists/'+songs_data[i].artist_eng+'.jpg');					

		objects.load_notice.visible=true;
		await new Promise(resolve=> avatar_loader.load(resolve))					
		for (let i=0;i<cards_num;i++){			
			const song_id_to_add=this.cur_song_id-1+i;
			if(song_id_to_add>-1){
				objects.songs_cards[i].y=380-i*70;
				await objects.songs_cards[i].set(song_id_to_add);					
			}			
		}	
		
		//определяем первую и последнюю карточки
		this.recalc_top_bottom_cards();
		
		objects.load_notice.visible=false;		
				
		objects.songs_cards_cont.y=0;				
		await anim2.add(objects.songs_cards_cont,{alpha:[0, 1]}, true, 1,'linear',false);
		

		objects.arrow_icon.y=345;		
		sound.play('arrow_end');
		await anim2.add(objects.arrow_icon,{x:[-200, 150]}, true, 1,'easeOutBounce');
		
		if(result==='win')
			await this.shift_up();		
		
		sound.play('note1');
		anim2.add(objects.up_button,{y:[-100, objects.up_button.sy]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.down_button,{x:[900, objects.down_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.back_button,{x:[-100, objects.back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.start_button,{x:[900, objects.start_button.sx]}, true, 0.5,'easeOutCubic');
		
	},

	check_vk_dialog(){
		if(game_platform!=='VK') return;
		if(Math.random()>0.5)
			return dialog.show('share');
		return dialog.show('invite_friends');
	},
	
	start_down(){
		
		if(anim2.any_on()){
			sound.play('locked2');
			return;				
		}

		sound.play('click');
		this.close();
		game.activate();
		
	},
		
	up_down(){			

		if(!objects.songs_cards_cont.ready||this.cur_song_id===songs_data.length-1||my_data.rating<this.cur_song_id+1){
		sound.play('locked2');
			return;				
		}
				
		sound.play('click');
				
		const top_song_id=this.top_card.song_id;
		const abs_bot_y=objects.songs_cards_cont.y+this.bottom_card.y+70;
		
		//добавляем сверху если надо
		if (top_song_id<songs_data.length-1 && abs_bot_y>450){
			this.bottom_card.y=this.top_card.y-70;
			this.bottom_card.set(top_song_id+1);	
		}				
				
		anim2.add(objects.songs_cards_cont,{y:[objects.songs_cards_cont.y, objects.songs_cards_cont.y+70]}, true, 0.5,'linear');					
		this.cur_song_id++;

		this.recalc_top_bottom_cards();
	},
	
	down_down(){	
		

		if(this.cur_song_id===0||!objects.songs_cards_cont.ready){
			sound.play('locked2');
			return;				
		}

		
		sound.play('click');
		
		//добавляем снизу если нужно
		const bot_song_id=this.bottom_card.song_id;
		const abs_top_y=objects.songs_cards_cont.y+this.top_card.y;
		
		if(bot_song_id>0) {
			
			this.top_card.y=this.bottom_card.y+70;
			this.top_card.set(bot_song_id-1);
		}
		
		anim2.add(objects.songs_cards_cont,{y:[objects.songs_cards_cont.y, objects.songs_cards_cont.y-70]}, true, 0.5,'linear');
		
		this.cur_song_id--;
		this.recalc_top_bottom_cards();
		
	},
	
	recalc_top_bottom_cards(){
		
		this.top_card = objects.songs_cards.reduce((prev, current) => {return prev.y < current.y ? prev : current});
		this.bottom_card = objects.songs_cards.reduce((prev, current) => {return prev.y > current.y ? prev : current});
		objects.songs_cards.forEach(card=>{			
			card.lock.visible=my_data.rating<card.song_id;
		})
	},
	
	back_button_down(){
		if(anim2.any_on()){
			sound.play('locked2');
			return;				
		}

		sound.play('click');
		this.close();
		main_menu.activate();
		
	},
		
	shift_up(){
		
		if(my_data.rating===this.cur_song_id){
			
			my_data.rating=this.cur_song_id+1;	
			firebase.database().ref('players/'+my_data.uid+'/rating').set(my_data.rating);
			sound.play('up');
			this.up_down();			
		}

		

		
	},
	
	close(){
		
		objects.songs_cards_cont.visible=false;
		objects.arrow_icon.visible=false;
		objects.start_button.visible=false;
		objects.up_button.visible=false;
		objects.down_button.visible=false;
		objects.back_button.visible=false;
	}
}

async function define_platform_and_language() {
	
	let s = window.location.href;
	
	if (s.includes('yandex')) {
		
		game_platform = 'YANDEX';
		
		if (s.match(/yandex\.ru|yandex\.by|yandex\.kg|yandex\.kz|yandex\.tj|yandex\.ua|yandex\.uz/))
			LANG = 0;
		else 
			LANG = 1;		
		return;
	}
	
	if (s.includes('vk.com')) {
		game_platform = 'VK';	
		LANG = 0;	
		return;
	}
	
	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = await language_dialog.show();
		return;
	}	

	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = await language_dialog.show();
		return;	
	}	
	
	if (s.includes('192.168')) {
			
		game_platform = 'DEBUG';	
		LANG = 1;
		return;	
	}	
	
	game_platform = 'UNKNOWN';	
	LANG = await language_dialog.show();
	
	

}

async function init_game_env(lang) {
		
	await define_platform_and_language();
	console.log(game_platform, LANG);
						
	//отображаем шкалу загрузки
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;	}body {display: flex;align-items: center;justify-content: center;background-color: rgba(41,41,41,1);flex-direction: column	}#m_progress {	  background: #1a1a1a;	  justify-content: flex-start;	  border-radius: 5px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset;	  border-radius: 5px;	  background: rgb(119, 119, 119);	  height: 70%;	  width: 0%;	}	</style></div><div id="m_progress">  <div id="m_bar"></div></div>';
	
	
	await load_resources();
	audio_context = new (window.AudioContext || window.webkitAudioContext)();	

	
	//создаем приложение пикси и добавляем тень
	
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer({width:M_WIDTH, height:M_HEIGHT,antialias:true});
	document.body.appendChild(app.renderer.view).style["boxShadow"] = "0 0 15px #000000";
	document.body.style.backgroundColor = 'rgb(141,211,200)';

	//запускаем главный цикл
	main_loop();

	resize();
	window.addEventListener("resize", resize);	
	
	window.addEventListener('keydown', function(event) { game.key_down(event.key)});
		
    //создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)

        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
            eval(load_list[i].code0);
            break;

        case "block":
            eval(load_list[i].code0);
            break;

        case "cont":
            eval(load_list[i].code0);
            break;

        case "array":
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }

    //обрабатываем вторую часть кода в объектах
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)
		
		
        switch (obj_class) {
        case "sprite":
            eval(load_list[i].code1);
            break;

        case "block":
            eval(load_list[i].code1);
            break;

        case "cont":	
			eval(load_list[i].code1);
            break;

        case "array":
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }
	
	await auth2.init();

	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({
			apiKey: "AIzaSyBVZDFjFDnqjuCBsvwzS2__2qaxRsPR_Yw",
			authDomain: "piano-4b7d6.firebaseapp.com",
			databaseURL: "https://piano-4b7d6-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "piano-4b7d6",
			storageBucket: "piano-4b7d6.appspot.com",
			messagingSenderId: "949126104513",
			appId: "1:949126104513:web:b8d9e2c88eeb183281db40"
		});
	}

	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}
	
	//ждем пока загрузится аватар
	let loader=new PIXI.Loader();
	loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});			
	await new Promise((resolve, reject)=> loader.load(resolve))	
	
			
	//получаем остальные данные об игроке
	const _other_data = await firebase.database().ref("players/"+my_data.uid).once('value');
	const other_data = _other_data.val();
	
	//определяем рейтинг
	my_data.rating = (other_data && other_data.rating) || 0;
	play_menu.cur_song_id=my_data.rating=0;

	//убираем лупу
	objects.id_loup.visible=false;

	//устанавлием имена
	make_text(objects.id_name,my_data.name,150);
	
	//устанавливаем рейтинг в попап
	objects.id_rating.text=my_data.rating;

	//обновляем данные в файербейс так как могли поменяться имя или фото
	firebase.database().ref("players/"+my_data.uid).set({name:my_data.name, pic_url: my_data.pic_url, rating : my_data.rating, tm:firebase.database.ServerValue.TIMESTAMP});


	//это событие когда меняется видимость приложения
	document.addEventListener("visibilitychange", vis_change);

	//keep-alive сервис
	setInterval(function()	{keep_alive()}, 40000);

	//убираем лупу
	some_process.loup_anim = function(){};
	objects.id_loup.visible=false;
		
	//ждем и убираем попап
	await new Promise((resolve, reject) => setTimeout(resolve, 1000));
	anim2.add(objects.id_cont,{y:[objects.id_cont.y,-180]}, false, 0.6,'easeInBack');	
	
	
	
	//показыаем основное меню
	main_menu.activate();
	
	console.clear()

}

var now, then=Date.now(), elapsed;
function main_loop() {

	now = Date.now();
	elapsed = now-then;

	if (elapsed > 10) {
		
		game_tick+=0.016666666;
		
		//обрабатываем минипроцессы
		for (let key in some_process)
			some_process[key]();	
		
		anim2.process();		
	}

	app.renderer.render(app.stage);		
	requestAnimationFrame(main_loop);	
}

