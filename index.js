var M_WIDTH=800, M_HEIGHT=450;
var app ={stage:{},renderer:{}},fbs, game_res, objects={}, game_tick=0,audio_context, my_turn=false, room_name = '', LANG = 0, git_src;
var any_dialog_active=0, some_process = {}, game_platform='';
var my_data={opp_id : ''},opp_data={};
var avatar_loader;
var speed=0.95;
var notes_loader={};
const pix_per_tm=125;
const PIANO_LINE_Y=281;
const midi_number_to_name={21:'A0',22:'Bb0',23:'B0',24:'C1',25:'Db1',26:'D1',27:'Eb1',28:'E1',29:'F1',30:'Gb1',31:'G1',32:'Ab1',33:'A1',34:'Bb1',35:'B1',36:'C2',37:'Db2',38:'D2',39:'Eb2',40:'E2',41:'F2',42:'Gb2',43:'G2',44:'Ab2',45:'A2',46:'Bb2',47:'B2',48:'C3',49:'Db3',50:'D3',51:'Eb3',52:'E3',53:'F3',54:'Gb3',55:'G3',56:'Ab3',57:'A3',58:'Bb3',59:'B3',60:'C4',61:'Db4',62:'D4',63:'Eb4',64:'E4',65:'F4',66:'Gb4',67:'G4',68:'Ab4',69:'A4',70:'Bb4',71:'B4',72:'C5',73:'Db5',74:'D5',75:'Eb5',76:'E5',77:'F5',78:'Gb5',79:'G5',80:'Ab5',81:'A5',82:'Bb5',83:'B5',84:'C6',85:'Db6',86:'D6',87:'Eb6',88:'E6',89:'F6',90:'Gb6',91:'G6',92:'Ab6',93:'A6',94:'Bb6',95:'B6',96:'C7',97:'Db7',98:'D7',99:'Eb7',100:'E7',101:'F7',102:'Gb7',103:'G7',104:'Ab7',105:'A7',106:'Bb7',107:'B7',108:'C8'}

shop_data=[{name:'acoustic_grand_piano',price:0,name_rus:'Акустический рояль',type:'inst'},
				{name:'electric_piano',price:1000,name_rus:'Электронное пианино',type:'inst'},
				{name:'acoustic_guitar_steel',price:2000,name_rus:'Акустическая гитара',type:'inst'},
				{name:'music_box',price:3000,name_rus:'Музыкальная шкатулка',type:'inst'},
				{name:'flute',price:4000,name_rus:'Флейта',type:'inst'},
				{name:'pan_flute',price:5000,name_rus:'Флейта Пана',type:'inst'},
				{name:'vibraphone',price:6000,name_rus:'Виброфон',type:'inst'},
				{name:'electric_guitar_jazz',price:7000,name_rus:'Электрогитара джаз',type:'inst'},
				{name:'slow5',price:100,name_rus:'Уменьшить скорость на 5% (на одну игру)',type:'slow_bonus'},
				{name:'slow10',price:200,name_rus:'Уменьшить скорость на 10% (на одну игру)',type:'slow_bonus'},
				{name:'slow15',price:300,name_rus:'Уменьшить скорость на 15% (на одну игру)',type:'slow_bonus'},
				{name:'slow20',price:400,name_rus:'Уменьшить скорость на 20% (на одну игру)',type:'slow_bonus'},
				{name:'slow25',price:500,name_rus:'Уменьшить скорость на 25% (на одну игру)',type:'slow_bonus'},
				{name:'life2',price:300,name_rus:'Еще 2 жизни (на одну игру)',type:'life_bonus'},
				{name:'life4',price:500,name_rus:'Еще 4 жизни (на одну игру)',type:'life_bonus'}];

const load_queue=[];

class song_card_class extends PIXI.Container{
		
	constructor(){
		
		super();
		
		this.song_id=0;
											
		this.avatar_bcg=new PIXI.Sprite();
		this.avatar_bcg.width=65;
		this.avatar_bcg.height=65;	
		this.avatar_bcg.x=25;
		this.avatar_bcg.y=5;
				
		this.avatar=new PIXI.Sprite();
		this.avatar.width=65;
		this.avatar.height=65;
		this.avatar.x=25;
		this.avatar.y=5;
		
		this.avatar_frame=new PIXI.Sprite();
		this.avatar_frame.width=65;
		this.avatar_frame.height=65;
		this.avatar_frame.x=25;
		this.avatar_frame.y=5;
				
		this.artist_name=new PIXI.BitmapText('123', {fontName: 'mfont',fontSize: 30}); 
		this.artist_name.x=120;
		this.artist_name.y=10;
		this.artist_name.tint=0xffffff;
		
		this.song_name=new PIXI.BitmapText('123', {fontName: 'mfont',fontSize: 25}); 
		this.song_name.x=120;
		this.song_name.y=40;
		this.song_name.tint=0xaaaaff;
		
		this.card_num=new PIXI.BitmapText('1', {fontName: 'mfont',fontSize: 35}); 
		this.card_num.x=10;
		this.card_num.y=35;
		this.card_num.anchor.set(0.5,0.5);
		this.card_num.tint=0x999999;
		
		this.bottom_line=new PIXI.Sprite(gres.bottom_line.texture);
		this.bottom_line.y=75;
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
			
		const song_data=songs_data[song_id];
		this.song_id=song_id;
		this.visible=true;
		
		this.artist_eng=song_data.artist_eng;
		this.artist_name.text=song_data.artist_rus;
		this.song_name.text=song_data.song_rus;
		this.avatar.texture=PIXI.Texture.WHITE;
		this.card_num.text=song_id+1;
		
		/*if(game_platform==='YANDEX' || game_platform==='DEBUG'){
			this.avatar.texture=gres.avatar_replace.texture;			
			return;
		}*/		
		
		//ставим в очередь загрузку аватара и его последующее присвоение
		play_menu.load_avatar(this);
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
		this.place.tint=0xffffff;
		this.place.x=20;
		this.place.y=22;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=43;
		this.avatar.y=14;
		this.avatar.width=this.avatar.height=44;


		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.name.tint=0xcceeff;
		this.name.x=105;
		this.name.y=22;

		this.rating=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating.x=298;
		this.rating.tint=0xFFFF00;
		this.rating.y=22;

		this.addChild(this.bcg,this.place, this.avatar, this.name, this.rating);
	}

}

class inst_card_class extends PIXI.Container{
	
	constructor(){
		
		super();
		
		this.bcg=new PIXI.Sprite(gres.inst_bcg.texture);
		this.bcg.width=this.bcg.height=80
		
		this.pic=new PIXI.Sprite();
		this.pic.width=this.pic.height=60
		this.pic.x=this.pic.y=10
		
		this.name='';
		
		this.pic.interactive=true;
		this.pic.pointerdown=play_menu.inst_down.bind(this);
		
		this.visible=false;
		this.addChild(this.bcg,this.pic);		
		
	}
	
	
}

class vpiano_player_card extends PIXI.Container{
		
	constructor(){
		super();
		
		this.bcg=new PIXI.Sprite(game_res.resources.vpiano_player_card_bcg.texture);
		this.bcg.width = 180;
		this.bcg.height = 40;
		
		this.note=new PIXI.Sprite(game_res.resources.note_img.texture);
		this.note.width = 40;
		this.note.height = 40;
		this.note.x=-40;
		this.note.visible=false;
		
		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 15,align: 'center'});
		this.name.tint=0x111111;
		this.name.x=20;
		this.name.y=20;
		this.name.anchor.set(0,0.5);

		this.addChild(this.note, this.bcg, this.name);
		
	}
		
}

class spark_class extends PIXI.Sprite{
	
	constructor(){
		
		super();
		
		this.anchor.set(0.5,0.5);
		this.dx=0;
		this.dy=0;
		this.slow_down=0.9;
		this.velocity=1;
		this.visible=false;
		
	}
	
	init(x,y){
		
		const ang=Math.random();
		
		this.dx=Math.cos(ang);
		this.dy=Math.sin(ang);
		this.velocity=1;
		this.slow_down=0.9;
	}
	
	process(){
		
		this.x+=this.dx;
		this.y+=this.dy;
		
		
	}
	
	
}

var message =  {
	
	promise_resolve :0,
	
	add : async function(text, timeout) {
		
		if (this.promise_resolve!==0)
			this.promise_resolve("forced");
		
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
		
		if (res === "forced")
			return;

		anim2.add(objects.message_cont,{x:[objects.message_cont.sx, -200]}, false, 0.25,'easeInBack');			
	},
	
	clicked : function() {
		
		
		message.promise_resolve();
		
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
		
	slot: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
	
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
	
	easeBridge(x){
		
		if(x<0.154)
			return 1.2-Math.pow(x*10-1.095445,2);
		if(x>0.845)
			return 1.2-Math.pow((1-x)*10-1.095445,2);
		return 1		
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
				game.exit();

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
			return new Promise(resolver=>{				
				objects.dialog_card.resolver=resolver;			
			})
			
		}
		
		if(type==='share'){
			if(this.share) return 'none';			
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
				vkBridge.send('VKWebAppShowWallPostBox', { message: 'Я играю в Пианиста и мне нравится!'})
				objects.dialog_card.resolver();

			};
			objects.dialog_no.pointerdown=function(){
				if(anim2.any_on())return;
				objects.dialog_no.visible=false;
				objects.dialog_ok.visible=false;
				objects.dialog_card.texture=gres.thanks_img.texture;	
				dialog.close_delayed();	
				sound.play('click');				
				

			};
			return new Promise(resolver=>{				
				objects.dialog_card.resolver=resolver;			
			})
		}
			
		if(type==='invite_friends'){
			if(this.invite)  return 'none';
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
				objects.dialog_no.visible=false;
				objects.dialog_ok.visible=false;
				objects.dialog_card.texture=gres.thanks_img.texture;	
				dialog.close_delayed();	
				sound.play('click');

			};
			return new Promise(resolver=>{				
				objects.dialog_card.resolver=resolver;			
			})
		}
		
		
	},
	
	close(){
		if(objects.dialog_card.resolver && typeof objects.dialog_card.resolver === 'function')
			objects.dialog_card.resolver();
		anim2.add(objects.dialog_cont,{alpha:[1, 0]},false,0.3,'linear');	
		
	},
	
	close_delayed(){
		
		setTimeout(function(){objects.dialog_card.resolver();dialog.close()},2000);
		
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

virtual_piano={
	
	vkeys_data:[[60,4,46.823,285.333,445.333,0],[62,50.824,93.647,285.333,445.333,0],[64,97.647,140.471,285.333,445.333,0],[65,144.471,187.294,285.333,445.333,0],[67,191.294,234.118,285.333,445.333,0],[69,238.118,280.941,285.333,445.333,0],[71,284.941,327.765,285.333,445.333,0],[72,331.765,374.588,285.333,445.333,0],[74,378.588,421.412,285.333,445.333,0],[76,425.412,468.235,285.333,445.333,0],[77,472.236,515.059,285.333,445.333,0],[79,519.059,561.882,285.333,445.333,0],[81,565.882,608.706,285.333,445.333,0],[83,612.706,655.529,285.333,445.333,0],[84,659.53,702.353,285.333,445.333,0],[86,706.353,749.176,285.333,445.333,0],[88,753.177,796,285.333,445.333,0],[61,32.157,65.49,285.333,373.245,1],[63,78.98,112.314,285.333,373.245,1],[66,172.627,205.961,285.333,373.245,1],[68,219.451,252.784,285.333,373.245,1],[70,266.275,299.608,285.333,373.245,1],[73,359.922,393.255,285.333,373.245,1],[75,406.745,440.078,285.333,373.245,1],[78,500.392,533.725,285.333,373.245,1],[80,547.216,580.549,285.333,373.245,1],[82,594.039,627.373,285.333,373.245,1],[85,687.686,721.02,285.333,373.245,1],[87,734.51,767.843,285.333,373.245,1]],
	instrument:'acoustic_grand_piano',
	last_note_time:0,
	my_song:{name:'111',notes:[]},
	notes_to_play_buffer:[],
	fb_time:0,
	presence_update_time:0,
	
	async activate(){
		
		
		//получаем время файербейс
		let snapshot=await firebase.database().ref('time').once('value');
		this.fb_time=snapshot.val();


		objects.vpiano_cont.visible=true;		

		
		//подгружаем ноты которые будут играть и звучать
		if(notes_loader[play_menu.instrument]===undefined)
			notes_loader[play_menu.instrument]=new PIXI.Loader();
		
		for (let key_data of this.vkeys_data){		
			const midi_number=key_data[0];
			if (notes_loader[virtual_piano.instrument].resources['M'+midi_number]===undefined)
				notes_loader[virtual_piano.instrument].add('M'+midi_number,git_src+`instruments/edited/${virtual_piano.instrument}/`+midi_number_to_name[midi_number]+'.mp3');			
		}
		
		await new Promise(resolve=>notes_loader[play_menu.instrument].load(resolve));
		objects.load_notice.visible=false;
				
		objects.desktop.interactive=true;
		objects.desktop.pointerdown=virtual_piano.key_down.bind(this);
		
		anim2.add(objects.vpiano_w,{x:[-800,objects.vpiano_w.sx]}, true, 1.5,'easeOutBack');	
		anim2.add(objects.vpiano_b,{x:[800,objects.vpiano_b.sx]}, true, 1.5,'easeOutBack');	
		
		firebase.database().ref('vpiano/players/'+my_data.name+'/tm').set(firebase.database.ServerValue.TIMESTAMP);
		firebase.database().ref('vpiano/notes').on('value',(snapshot) => {virtual_piano.new_notes(snapshot.val())});
		firebase.database().ref('vpiano/players').on('value',(snapshot) => {virtual_piano.players_change(snapshot.val())});
		firebase.database().ref('vpiano/players/'+my_data.uid).onDisconnect().remove();
		some_process.vpiano=this.process.bind(this);
		
		this.presence_update_time=Date.now();
		this.my_song.name=my_data.name;
		
	},
	
	back_button_down(){
		
		this.close();
		main_menu.activate();
		
	},
	
	new_notes(data){		

		if (data.notes.length>0 && data.name!==my_data.name) {			
			const first_note_time=data.notes[0][1];
			const d=Date.now()-first_note_time;
			data.notes.forEach(note=>{				
				virtual_piano.notes_to_play_buffer.push([note[0],d+note[1]+500,data.name])				
			})			
		}
		
	},
	
	stringToColor(str) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		let color = '0x';
		for (let i = 0; i < 2; i++) {
			let value = (hash >> (i * 8)) & 0xFF;
			color += ('00' + value.toString(16)).substr(-2);
		}
		return color+'ff';
	},
	
	players_change(data){
		
		let cnt=0;
		for (let name of Object.keys(data)){
			
			if (data[name].tm>virtual_piano.fb_time-100000) {
				objects.pianists[cnt].visible=true;
				objects.pianists[cnt].name.text=name;
				objects.pianists[cnt].bcg.tint=virtual_piano.stringToColor(name);				
				cnt++;				
			}

		}		
		
	},
		
	show_playing_player(name){
		
		objects.pianists.forEach(p=>{
			if (p.visible && p.name.text===name){
					
				
				anim2.add(p.note,{alpha:[1, 0]},false,0.5,'linear');	
				return;
			}			
		})
		
		
	},
	
	process(){
		
		if (this.my_song.notes.length>0 && (Date.now()-this.last_note_time)>1500)
			this.send_notes();
		
		if (this.my_song.notes.length>25)
			this.send_notes();
		
		if (Date.now()-this.presence_update_time>5000){
			this.presence_update_time=Date.now();
			firebase.database().ref('vpiano/players/'+my_data.name+'/tm').set(firebase.database.ServerValue.TIMESTAMP);
		}
			
		
		if (this.notes_to_play_buffer.length>0){
			
			//это первая нота с временем
			const note_data=this.notes_to_play_buffer[0];
						
			if (Date.now()>note_data[1]){			
			
				sound.play('M'+note_data[0],notes_loader[this.instrument].resources);
				this.show_playing_player(note_data[2]);
				const note_data2 = this.vkeys_data.find(element => element[0]===note_data[0]);
				this.highlight_key(note_data2);
				this.notes_to_play_buffer.shift();
			}			
		}
	},
	
	send_notes(){		
		console.log('notes_sent')
		firebase.database().ref('vpiano/notes').set(this.my_song);
		this.my_song.notes=[];
	},
	
	key_down(e){
		
		//координаты указателя
		const mx = e.data.global.x/app.stage.scale.x;
		const my = e.data.global.y/app.stage.scale.y;
		
		let note_to_play_data=null;
		for (let vkey of this.vkeys_data){
			if (mx>=vkey[1] && mx<=vkey[2] && my>=vkey[3]&&my<=vkey[4])
				note_to_play_data=vkey;			
		}

			
		if (note_to_play_data){
			
			sound.play('M'+note_to_play_data[0],notes_loader[this.instrument].resources)			
			this.highlight_key(note_to_play_data)		
			this.my_song.notes.push([note_to_play_data[0],Date.now()]);
			this.last_note_time=Date.now();
			this.show_playing_player(my_data.name);
		}
		
	},
	
	highlight_key(note){
		
		let tar_hl=[];
		
		if (note[5]===0)
			tar_hl=objects.w_hl
		else
			tar_hl=objects.b_hl
			
		//получаем свободную ноту для хайлайта
		for(let hl of tar_hl){
			
			if (hl.visible===false){
				hl.x=note[1]-10;
				hl.y=note[3]-10;			
				anim2.add(hl,{alpha:[1,0]}, false, 0.5,'linear');						
				return;
			}			
		}			
	},
	
	close(){
		
		some_process.vpiano=function(){};
		objects.vpiano_cont.visible=false;
		
		firebase.database().ref('vpiano/players/'+my_data.uid).remove();
		firebase.database().ref('vpiano/notes').off();
		firebase.database().ref('vpiano/players').off();
		
	}
	
	
	
}

game={	
	
	main_notes:[],
	bass_notes:[],	
	all_notes:[],
	song_id:0,
	audio_buffers :[],
	play_start:0,
	life:3,
	on:false,
	notes_in_song:0,
	touches_cnt:0,
	piano_key_step_x:0,
	piano_key_width:0,
	piano_key_start_x:0,
	active_keys_num:0,
	unique_notes:{},
	falling_note_tex:0,
	render_texture:null,
	
	
	show_render_texture(){
		
		const renderTexture = PIXI.RenderTexture.create({ width: 820, height: 190 });
		
		const spr=new PIXI.Sprite(gres.money_sack.texture);
		app.renderer.render(spr, { renderTexture });
		objects.desktop.texture=renderTexture;
		
		
	},
	
	async activate() {		
	
		await ad.check_and_show();
		//play_menu.cur_song_id=43;		
		objects.load_notice.visible=true;
		const midi_file_id=songs_data[play_menu.cur_song_id].file_name;
		speed=+songs_data[play_menu.cur_song_id].speed;
		const midi = await Midi.fromUrl(git_src+'/new_midi/'+midi_file_id+'.mid');
				
		//загружаем дизайн
		const design_id=songs_data[play_menu.cur_song_id].design_id;
				
		if (!gres[`bcg${design_id}`])
			game_res.add(`bcg${design_id}`,`${git_src}res/ART/bcg${design_id}.jpg`);
		if (!gres[`piano${design_id}`])
			game_res.add(`piano${design_id}`,`${git_src}res/ART/piano${design_id}.png`);
		if (!gres[`falling_note${design_id}`])
			game_res.add(`falling_note${design_id}`,`${git_src}res/ART/falling_note${design_id}.png`);
		await new Promise(resolve=> game_res.load(resolve))
		
		
		this.falling_note_tex=gres[`falling_note${design_id}`].texture;
		objects.desktop.texture=gres[`bcg${design_id}`].texture;
		objects.piano_bcg.texture=gres[`piano${design_id}`].texture;
		
		
		this.unique_notes={};
		let all_unique_notes={};
		
		
		//жизни
		this.life=5;
		if(play_menu.cur_song_id>5) this.life=4;
		if(play_menu.cur_song_id>10) this.life=3;
		if(play_menu.cur_song_id>15) this.life=2;
		if(play_menu.cur_song_id>20) this.life=1;
		
		this.life=5;
		
		//бонусы жизни
		if (shop.life_bonus==='life2') this.life+=2;
		if (shop.life_bonus==='life4') this.life+=4;
		if (this.life>5) this.life=5;		
		
		//бонусы замедления
		if (shop.slow_bonus==='slow5') speed=speed-speed*0.05;
		if (shop.slow_bonus==='slow10') speed=speed-speed*0.10;
		if (shop.slow_bonus==='slow15') speed=speed-speed*0.15;
		if (shop.slow_bonus==='slow20') speed=speed-speed*0.2;
		if (shop.slow_bonus==='slow25') speed=speed-speed*0.25;
		
		objects.bonuses.visible=true;
		objects.bonuses.text=shop.life_bonus + ' ' +shop.slow_bonus
		
		for (let i=0;i<5;i++){
			if (i<this.life)
				objects.hearts[i].texture=gres.heart_img.texture;
			else
				objects.hearts[i].texture=gres.no_heart_img.texture;
		}
		anim2.add(objects.hearts_cont,{y:[-60, objects.hearts_cont.sy]},true,0.4,'linear');
		
		//определяем уникальные ноты чтобы только их загрузить (они загрузятся в объект по возрастанию)
		this.main_notes=midi.tracks.find(t => t.name==='Electric Piano').notes;
		this.bass_notes=midi.tracks.find(t => t.name==='Grand Piano')?.notes||[];
		this.main_notes.forEach(n=>n.track='Electric Piano');
		this.bass_notes.forEach(n=>n.track='Grand Piano');
		
		this.all_notes=[...this.main_notes,...this.bass_notes];
		for(let note of this.all_notes) note.played=false;
		for(let note of this.main_notes) {this.unique_notes[note.midi]=note.midi;note.catched=false;note.finished=false;note.added=false;};		
		for(let note of this.all_notes) all_unique_notes[note.midi]=note.midi;		
		
		//считаем сколько нот в песне
		this.notes_in_song=this.main_notes.length+5;
		objects.taps_left.text=game.notes_in_song;
		
		//считаем количество нот
		const unique_notes_arr=Object.keys(this.unique_notes);
		const unique_notes_num=unique_notes_arr.length;
		this.active_keys_num=unique_notes_num;

		const key_params={};
		if (unique_notes_num>=0&&unique_notes_num<10)
			{key_params.white_spacing=15;key_params.id=1;key_params.tex_side_margin=30}
		if (unique_notes_num>=10&&unique_notes_num<15)
			{key_params.white_spacing=7;key_params.id=2;key_params.tex_side_margin=20}
		if (unique_notes_num>=15&&unique_notes_num<30)
			{key_params.white_spacing=3;key_params.id=3;key_params.tex_side_margin=20}

		//параметры разных размеров
		const white_spacing=key_params.white_spacing;
		const keys_overlap=20-white_spacing;
		
		const start_shift_x=white_spacing-10;
		this.piano_key_start_x=start_shift_x;
		
		const end_shift_x=10-white_spacing;
		
		const num_of_overlaps=unique_notes_num-1;
		const total_overlap_len=num_of_overlaps*keys_overlap;
		
		//располагаем клавиши на экране
		const adj_width=800-start_shift_x+end_shift_x;
		const piano_key_width=(adj_width+total_overlap_len)/unique_notes_num;
		this.piano_key_width=piano_key_width;
		
		//расставляем клавиши
		const step_x=piano_key_width-keys_overlap;
		this.piano_key_step_x=step_x;
		
		objects.piano_keys.forEach(key=>key.visible=false);
		objects.piano_keys_press.forEach(key=>key.visible=false);
		
		//это маска для фона (рендер текстура)
		this.render_texture = PIXI.RenderTexture.create({ width: 800, height: 180 });
		
		for(let k=0;k<unique_notes_num;k++){

			const key_spr=objects.piano_keys[k];
			
			key_spr.visible=true;
				
			key_spr.width=piano_key_width;
			key_spr.height=180;			
			key_spr.x=start_shift_x+k*step_x;			
			key_spr.y=270;
			key_spr.midi=+unique_notes_arr[k];
			key_spr.texture=gres['key_img'+key_params.id].texture;
			key_spr.leftWidth=key_spr.rightWidth=key_params.tex_side_margin;
			
			const key_press_spr=objects.piano_keys_press[k];
			key_press_spr.width=piano_key_width;
			key_press_spr.height=180;			
			key_press_spr.x=start_shift_x+k*step_x;			
			key_press_spr.y=270;
			key_press_spr.texture=gres['key_press_img'+key_params.id].texture;
			key_press_spr.leftWidth=key_press_spr.rightWidth=key_params.tex_side_margin;
			
			const key_mask=new PIXI.NineSlicePlane(gres['key_mask'+key_params.id].texture,10,0,10,0);
			key_mask.width=piano_key_width;
			key_mask.x=key_spr.x;
			key_mask.y=0;
			key_mask.height=180;
			key_mask.leftWidth=key_mask.rightWidth=key_params.tex_side_margin;
			
			app.renderer.render(key_mask, {renderTexture:this.render_texture,clear:false});
		}
		
		//делаем маску из рендер текстуры
		objects.piano_bcg_mask.texture=this.render_texture;
		objects.piano_bcg.mask=objects.piano_bcg_mask;
		//objects.desktop.texture=render_texture;
		
		//добавляем порядок ноты по возрастанию
		let ind = 0;
		for (key in this.unique_notes)		
			this.unique_notes[key] = ind++;

		//определяем время первой ноты
		let first_note_time=this.main_notes[0].time;
		if(this.bass_notes.length>0 && this.bass_notes[0].time<first_note_time)
			first_note_time=this.bass_notes[0].time

		//начальное расположение падающих нот
		objects.falling_notes.forEach(function(f){
			f.visible=false;
			f.midi=0;
			f.time=0;
			f.true_note_index=0;
			f.catched=false;
			anim2.kill_anim(f);			
		})		
		
		//подгружаем ноты которые будут играть и звучать
		if(notes_loader[play_menu.instrument]===undefined)
			notes_loader[play_menu.instrument]=new PIXI.Loader();
		for (let note of Object.keys(all_unique_notes)){
			if (notes_loader[play_menu.instrument].resources['M'+note]===undefined)
				notes_loader[play_menu.instrument].add('M'+note,git_src+`instruments/edited/${play_menu.instrument}/`+midi_number_to_name[note]+'.mp3');			
		}

		
		await new Promise(resolve=>notes_loader[play_menu.instrument].load(resolve));
		objects.load_notice.visible=false;
		
		anim2.add(objects.piano_keys_cont,{y:[600, 0]}, true, 0.5,'easeOutCubic');
		objects.falling_notes_cont.visible=true;
		anim2.add(objects.close_button,{y:[-200, objects.close_button.sy]}, true, 0.5,'easeOutCubic');
				
		//показываем инструкцию для новичков
		if(my_data.rating===0) await dialog.show('rules');
		
		//3 доп секунды до первой ноты
		this.play_start=Date.now()*0.001-first_note_time/speed+3;
		this.on=true;
		some_process.game=this.process.bind(game);
	},
	
	piano_down(e){
		
		const key_space_width=800/this.active_keys_num;
		const px=e.data.global.x/app.stage.scale.x
		
		
		for (let k=0;k<this.active_keys_num;k++){
			
			const x_from=key_space_width*k
			const x_to=key_space_width*(k+1);
			if (px>x_from&&px<x_to){
				this.press_key(k);
				return;
			}			
		}		
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
		
		source.buffer = notes_loader[play_menu.instrument].resources[midi_number].sound.media.buffer;			
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
	
	add_sparks(key, d){
		
		let sparks_num=0;


		if (d<0.04)	sparks_num=3
		if (d<0.03)	sparks_num=5
		if (d<0.02) sparks_num=7
		if (d<0.01) sparks_num=9
		
		const sx=key.x+key.width/2;
		const sy=300;		
			
		const sparks = objects.sparks.filter(s=>!s.visible);
		
		for (let i=0;i<Math.min(sparks_num,sparks.length);i++){
			
			const spark=sparks[i];
			const rand_ang=Math.random()*2-1;
			spark.x=sx;
			spark.y=sy;
			spark.dx=Math.sin(rand_ang);
			spark.dy=-Math.cos(rand_ang);
			spark.velocity=Math.random()*3+1;
			spark.slow_down=0.98;			
			spark.tint=0xffffff*(0.5+Math.random()*0.5);
			spark.visible=true;
			
		}
	
		
	},
	
	press_key(id){
		
		if(!game.on) return;
		const tm_sec=Date.now()*0.001;
		const key=objects.piano_keys[id];
		const cur_sec=(tm_sec-game.play_start)*speed;
		
		//подсвечиваем нажатую клавишу
		const cur_press_hl=objects.piano_keys_press[id];
		cur_press_hl.x=key.x;
		anim2.add(cur_press_hl,{alpha:[1, 0]},false,1,'linear',false);

		sound.play('M'+key.midi,notes_loader[play_menu.instrument].resources)
		
		//выявляем на какие ноты это могло быть нажато
		let close_notes={};
		for(let k=0;k<objects.falling_notes.length;k++){
			const note = objects.falling_notes[k];
			const note_time = note.time;
			const note_midi = note.midi;
			const d=Math.abs(note_time-cur_sec);
			if(!note.catched&&note_midi===key.midi&&d<0.25)			
				close_notes[k]=d;				
		}	
		
		//если нажали какую-то ноту близкую то выявляем самую близкую
		if (Object.keys(close_notes).length>0) {
			const min_note_ind = Object.keys(close_notes).reduce((key, v) => close_notes[v] < close_notes[key] ? v : key);			
			
			const fnote=objects.falling_notes[+min_note_ind];
			//console.log('PROGRESS: ',close_notes[min_note_ind])
			game.add_sparks(key,close_notes[min_note_ind]);
			fnote.catched=key;
			play_menu.money_in_sack++;
			fnote.texture=gres.falling_note_ok_img.texture;			
			anim2.add(fnote,{scale_xy:[fnote.scale_xy, fnote.scale_xy*2],alpha:[1,0]},false,2,'linear',false);
			
		}else{
			this.decrease_life();
		}
				
		//game.notes_in_song--;
		objects.taps_left.text=game.notes_in_song;
		
		if(game.notes_in_song===0) game.stop();		
		
	},
	
	async wait_instructions(){
		
		objects.instructions.visible=true;
		await new Promise(resolver=>{			
			objects.instructions.resolver=resolver;
		})
		objects.instructions.visible=false;
		
	},
		 
	stop(){
		
		if(!this.on) return;
		
		this.on=false;
		sound.play('crowd_whoo');
		dialog.show('game_over');		
		some_process.game=function(){};
	},
	
	close(){
		
		shop.life_bonus='';
		shop.slow_bonus='';
		objects.bonuses.visible=false;
		
		some_process.game=function(){};
		objects.piano_keys_cont.visible=false;
		objects.falling_notes_cont.visible=false;
		objects.hearts_cont.visible=false;
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

		if(!game.on) return;
		
		const key_codes=[49,50,51,52,53,54,55,56,57,48,189,187,8,45,36];
		const key_index=key_codes.findIndex(x => x === e.keyCode);		
		
		if(key_index===-1) return;
		
		this.touch_down.bind(objects.piano_keys[key_index])();

	},
			
	add_falling_note(note_midi, note_time, note_index){
		
		for(let note of objects.falling_notes){
			if(!note.visible){				
				note.time=note_time;
				note.midi=note_midi;
				note.x=this.piano_key_start_x+this.unique_notes[note_midi]*this.piano_key_step_x+this.piano_key_width*0.5;
				note.visible=true;
				note.width=50;
				note.height=50;
				note.alpha=1;
				note.true_note_index=note_index;
				note.finished=false;
				note.catched=false;
				note.tint=0xffffff;	
				note.texture=this.falling_note_tex;		
				//console.log('добавлена нота')
				return;
			}			
		}
		alert('Не нашли свободных нот!!!')

	},
			
	process(){
				
		const tm_sec=Date.now()*0.001;
		const cur_sec=(tm_sec-this.play_start)*speed;
				
		//это басы они играют сами по себе
		for(let k=0;k<this.bass_notes.length;k++){
			const note = this.bass_notes[k];
			const note_time = note.time;
			const note_midi = note.midi;
			const dt=note_time-cur_sec;
			const pos_y=PIANO_LINE_Y-dt*100;			
			if(pos_y>=PIANO_LINE_Y && !note.played){				
				sound.play('M'+note_midi,notes_loader[play_menu.instrument].resources);					
				note.played=true;					
			}
		}	

		//это проверка и добавка спрайтов нот
		let no_notes=true;		
		for(let k=0;k<this.main_notes.length;k++){
			const note = this.main_notes[k];
			const note_time = note.time;
			const note_midi = note.midi;
			const dt=note_time-cur_sec;
			const pos_y=PIANO_LINE_Y-dt*pix_per_tm;			
			if (!note.added&&pos_y>-50){			
				this.add_falling_note(note_midi, note_time,k);
				note.added=true;
			}			
			if(pos_y<500) no_notes=false;
		}
		

		
		//это обработка падающих нот-спрайтов
		for(let k=0;k<objects.falling_notes.length;k++){

			const visible=objects.falling_notes[k].visible;
			if(visible){
				
				const sprite_note = objects.falling_notes[k];
				const note_time = sprite_note.time;
				const note_midi = sprite_note.midi;
				const dt=cur_sec-note_time;
				const pos_y=PIANO_LINE_Y+dt*pix_per_tm;
				
				//отмечаем запоздалую ноту
				if(!sprite_note.catched&&pos_y>PIANO_LINE_Y) sprite_note.tint=0xff0000;				
							
							
				if(dt>0.25&&!sprite_note.catched) {
					
					sprite_note.catched=true;
					game.decrease_life();
					sprite_note.texture=gres.falling_note_no_img.texture;	
					anim2.add(sprite_note,{scale_xy:[sprite_note.scale_xy, sprite_note.scale_xy*2],alpha:[1,0]},false,2,'linear',false);

				}

				sprite_note.y=pos_y;
				
			}
		
		}	
		
		if(no_notes){
			sound.play('applause');			
			this.close();			
			play_menu.activate('win');			
		}
		
		for (let s=0;s<objects.sparks.length;s++){
			const spark=objects.sparks[s];
			if(spark.visible){				
				
				spark.x+=spark.dx*spark.velocity
				spark.y+=spark.dy*spark.velocity
				spark.velocity*=spark.slow_down;
				spark.alpha=Math.min(spark.velocity,1);

				if (spark.velocity<0.01) spark.visible=false;
			}			
		}
		
		
	}

}

async function stat_all_songs(){
	
	
	for (let song of songs_data){
		console.log(song);
		const midi = await Midi.fromUrl(git_src+'/new_midi/'+song.file_name+'.mid');
		
		let main_notes=midi.tracks.filter(t => t.name==='MAIN')[0].notes;
		let bass_notes=midi.tracks.filter(t => t.name==='BASS')[0].notes;
		main_notes.forEach(n=>n.track='MAIN');
		bass_notes.forEach(n=>n.track='BASS');
		
		let unique_notes={};
		
		for(let note of main_notes) {unique_notes[note.midi]=note.midi;note.catched=false;note.finished=false;note.added=false;};
		//считаем количество нот
		const unique_notes_arr=Object.keys(unique_notes);
		const unique_notes_num=unique_notes_arr.length;	
		
		console.log(unique_notes_num);
		
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
		
		if (game_platform==='YANDEX')
			await this.show();
		else
			await Promise.all([dialog.show('ad_break'), this.show()])

	},
	
	async show() {
				
		if (game_platform==="YANDEX") {			
			//показываем рекламу
			await new Promise(resolver=>{
				
				window.ysdk.adv.showFullscreenAdv({
					callbacks: {
						onClose: function() {resolver()}, 
						onError: function() {resolver()},
					}
				})				
				
			})

		}
		
		if (game_platform==="VK") {
					 
			await vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})

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

players_cache={
	
	players:{},
	
	async update(uid,params={}){
				
		//если игрока нет в кэше то создаем его
		if (!this.players[uid]) this.players[uid]={}
							
		//ссылка на игрока
		const player=this.players[uid];
		
		//заполняем параметры которые дали
		for (let param in params) player[param]=params[param];
		
		if (!player.name) player.name=await fbs_once('players/'+uid+'/name');
		if (!player.rating) player.rating=await fbs_once('players/'+uid+'/rating');
	},
	
	async update_avatar(uid){
		
		const player=this.players[uid];
		if(!player) alert('Не загружены базовые параметры '+uid);
		
		//если текстура уже есть
		if (player.texture) return;
		
		//если нет URL
		if (!player.pic_url) player.pic_url=await fbs_once('players/'+uid+'/pic_url');
		
		if(player.pic_url==='https://vk.com/images/camera_100.png')
			player.pic_url='https://akukamil.github.io/domino/vk_icon.png';
		
		//загружаем и записываем текстуру
		if (player.pic_url) player.texture=PIXI.Texture.from(player.pic_url);	
		
	}	
}

lb={

	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],
	last_update:0,

	show() {

		objects.desktop.texture=gres.lb_bcg.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.5,'linear');
		
		anim2.add(objects.lb_1_cont,{x:[-150, objects.lb_1_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_2_cont,{x:[-150, objects.lb_2_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_3_cont,{x:[-150, objects.lb_3_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 0.5,'easeOutCubic');
				
		objects.lb_cards_cont.visible=true;
		objects.lb_back_button.visible=true;

		for (let i=0;i<7;i++) {
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];
			objects.lb_cards[i].place.text=(i+4)+".";

		}

		if (Date.now()-this.last_update>120000){
			this.update();
			this.last_update=Date.now();
		}


	},

	close() {


		objects.lb_1_cont.visible=false;
		objects.lb_2_cont.visible=false;
		objects.lb_3_cont.visible=false;
		objects.lb_cards_cont.visible=false;
		objects.lb_back_button.visible=false;

	},

	back_button_down() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};


		sound.play('click');
		this.close();
		main_menu.activate();

	},

	async update() {

		let leaders=await fbs.ref('players').orderByChild('rating').limitToLast(20).once('value');
		leaders=leaders.val();

		const top={
			0:{t_name:objects.lb_1_name,t_rating:objects.lb_1_rating,avatar:objects.lb_1_avatar},
			1:{t_name:objects.lb_2_name,t_rating:objects.lb_2_rating,avatar:objects.lb_2_avatar},
			2:{t_name:objects.lb_3_name,t_rating:objects.lb_3_rating,avatar:objects.lb_3_avatar},			
		}
		
		for (let i=0;i<7;i++){	
			top[i+3]={};
			top[i+3].t_name=objects.lb_cards[i].name;
			top[i+3].t_rating=objects.lb_cards[i].rating;
			top[i+3].avatar=objects.lb_cards[i].avatar;
		}		
		
		//создаем сортированный массив лидеров
		const leaders_array=[];
		Object.keys(leaders).forEach(uid => {
			
			const leader_data=leaders[uid];
			const leader_params={uid,name:leader_data.name, rating:leader_data.rating, pic_url:leader_data.pic_url};
			leaders_array.push(leader_params);
			
			//добавляем в кэш
			players_cache.update(uid,leader_params);			
		});
		
		//сортируем....
		leaders_array.sort(function(a,b) {return b.rating - a.rating});
				
		//заполняем имя и рейтинг
		for (let place in top){
			const target=top[place];
			const leader=leaders_array[place];
			target.t_name.set2(leader.name,place>2?190:130);
			target.t_rating.text=leader.rating;			
		}
		
		//заполняем аватар
		for (let place in top){			
			const target=top[place];
			const leader=leaders_array[place];
			await players_cache.update_avatar(leader.uid);			
			target.avatar.texture=players_cache.players[leader.uid].texture;		
		}
	
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

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid) ;
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

	if (document.hidden){		
		game.stop();	
		PIXI.sound.volumeAll=0;	
	}else{
		PIXI.sound.volumeAll=1;	
	}
		
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

	game_res.add('money',git_src+'sounds/money.mp3');
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
	game_res.onProgress.detachAll();
	document.getElementById("m_progress").outerHTML = "";	
	
}

language_dialog={
	
	p_resolve : {},
	
	show : function() {
				
		return new Promise(function(resolve, reject){


			document.body.innerHTML='<style>		html,		body {		margin: 0;		padding: 0;		height: 100%;	}		body {		display: flex;		align-items: center;		justify-content: center;		background-color: rgba(24,24,64,1);		flex-direction: column	}		.two_buttons_area {	  width: 70%;	  height: 50%;	  margin: 20px 20px 0px 20px;	  display: flex;	  flex-direction: row;	}		.button {		margin: 5px 5px 5px 5px;		width: 50%;		height: 100%;		color:white;		display: block;		background-color: rgba(44,55,100,1);		font-size: 10vw;		padding: 0px;	}  	#m_progress {	  background: rgba(11,255,255,0.1);	  justify-content: flex-start;	  border-radius: 100px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 10px 40px -10px #fff;	  border-radius: 100px;	  background: #fff;	  height: 70%;	  width: 0%;	}	</style><div id ="two_buttons" class="two_buttons_area">	<button class="button" id ="but_ref1" onclick="language_dialog.p_resolve(0)">RUS</button>	<button class="button" id ="but_ref2"  onclick="language_dialog.p_resolve(1)">ENG</button></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
			language_dialog.p_resolve = resolve;	
						
		})
		
	}
	
}

shop={
	

	cur_bonus:0,
	life_bonus:'',
	slow_bonus:'',
	
	activate(){
		
		objects.shop_cont.visible=true;
		
		this.update();
	},
	
	update(){
		
		objects.shop_inst_pic.texture=gres[shop_data[this.cur_bonus].name].texture;
		objects.shop_inst_name.text=shop_data[this.cur_bonus].name_rus;
		objects.shop_inst_price.text=shop_data[this.cur_bonus].price +'$';
		objects.shop_money.text=my_data.money +'$';
	},
	
	close(){
		objects.shop_cont.visible=false;
		
	},
	
	prv_inst_down(){
		
		if(anim2.any_on()){
			sound.play('locked2');
			return;				
		}
		
		if (this.cur_bonus===0) {
			sound.play('locked2');
			return;
		}
		
		
		
		sound.play('click');
		this.cur_bonus--;
		this.update();
		
	},
	
	next_inst_down(){
		
		if(anim2.any_on()){
			sound.play('locked2');
			return;				
		}
		
		if (this.cur_bonus===shop_data.length-1){
			sound.play('locked2');
			return;
		}
		
		sound.play('click');
		this.cur_bonus++;
		this.update();
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
	
	buy_down(){
		
		if(anim2.any_on()){
			sound.play('locked2');
			return;				
		}
		
		const price=shop_data[this.cur_bonus].price;
		const name_rus=shop_data[this.cur_bonus].name_rus;
		
		if (my_data.money<price){
			message.add('У вас нет денег для покупки');
			sound.play('locked2');
			return;		
		}
		
		if (shop_data[this.cur_bonus].type==='inst' && my_data.inst.includes(this.cur_bonus)){
			message.add('Инструмент уже куплен');
			sound.play('locked2');
			return;			
		}
		
		if (shop_data[this.cur_bonus].name===this.life_bonus || shop_data[this.cur_bonus].name===this.slow_bonus){
			message.add('Бонус уже куплен');
			sound.play('locked2');
			return;			
		}
		
		
		my_data.money-=price;
		firebase.database().ref('players/'+my_data.uid+'/money').set(my_data.money);
		this.update();
		
		sound.play('click');
				
		if (shop_data[this.cur_bonus].type==='inst'){
			my_data.inst.push(this.cur_bonus);
			firebase.database().ref('players/'+my_data.uid+'/inst').set(my_data.inst);			
		}
		
		if (shop_data[this.cur_bonus].type==='life_bonus')
			this.life_bonus=shop_data[this.cur_bonus].name	

		if (shop_data[this.cur_bonus].type==='slow_bonus')
			this.slow_bonus=shop_data[this.cur_bonus].name	
		
		
		sound.play('money');
		message.add('Куплено! ('+name_rus+')');
		
	}
	
	
}

main_menu={
	
	activate(){
		
		sound.play('start');
		objects.desktop.texture=gres.desktop.texture;
		anim2.add(objects.game_title,{y:[-100, objects.game_title.sy],alpha:[0,1]}, true, 1,'linear',false);
		anim2.add(objects.play_button,{x:[-300, objects.play_button.sx],alpha:[0,1]}, true, 1,'linear',false);
		anim2.add(objects.lb_button,{x:[900, objects.lb_button.sx],alpha:[0,1]}, true, 1,'linear',false);
		anim2.add(objects.rules_button,{y:[500, objects.rules_button.sy],alpha:[0,1]}, true, 1,'linear',false);
		anim2.add(objects.shop_button,{y:[500, objects.shop_button.sy],alpha:[0,1]}, true, 1,'linear',false);
		anim2.add(objects.vpiano_button,{x:[800, objects.vpiano_button.sx],alpha:[0,1]}, true, 1,'linear',false);
	},
	
	play_button_down(){
		if(anim2.any_on())return;
		sound.play('click');
		this.close();
		play_menu.activate();
		
	},
	
	async rules_button_down(){
		if(anim2.any_on())return;
		dialog.show('rules');
		
	},
	
	lb_down(){
		
		if(anim2.any_on())return;
		this.close();
		lb.show();
		
		
	},
		
	shop_button_down(){
		
		if(anim2.any_on()){
			sound.play('locked2');
			return;				
		}
		
		sound.play('click');
		this.close();
		shop.activate();		
	},
		
	vpiano_button_down(){
		
		if(anim2.any_on()){
			sound.play('locked2');
			return;				
		}
		
		sound.play('click');
		this.close();
		virtual_piano.activate();
		
		
	},
		
	close(){
		
		anim2.add(objects.game_title,{y:[objects.game_title.sy,-100]}, false, 1,'linear',false);
		anim2.add(objects.play_button,{x:[objects.play_button.sx,-300]}, false, 1,'linear',false);
		anim2.add(objects.lb_button,{x:[objects.lb_button.sx,900]}, false, 1,'linear',false);
		anim2.add(objects.rules_button,{y:[objects.rules_button.sy,500]}, false, 1,'linear',false);
		anim2.add(objects.shop_button,{y:[objects.shop_button.y,500],alpha:[1,0]}, false, 1,'linear',false);
		anim2.add(objects.vpiano_button,{x:[objects.vpiano_button.x,800],alpha:[1,0]}, false, 1,'linear',false);
	}
		
}

play_menu={
	
	song_to_play:0,
	top_card:null,
	bot_card:null,
	cur_song_id:3,
	cur_bonus:0,
	instrument:'acoustic_grand_piano',
	money_in_sack:0,
	
	async activate(result){
		
		const res=await this.check_vk_dialog();
		
		//время рекламы
		if(res==='none')
			await ad.check_and_show();
		
		this.cur_song_id=my_data.rating;
		
		if(!avatar_loader) avatar_loader=new PIXI.Loader();
				
		const cards_num=objects.songs_cards.length;
		
		if(this.money_in_sack>0){			
			anim2.add(objects.money_sack_cont,{x:[-200, 0],scale_x:[0.4,1]},false,3,'easeBridge');
			sound.play('money');
			objects.money_sack_cont.visible=true;
			objects.money_sack_title.text=this.money_in_sack+'$';
			my_data.money+=this.money_in_sack;	
			firebase.database().ref('players/'+my_data.uid+'/money').set(my_data.money);
			this.money_in_sack=0;
		}
		
		//располагаем карточки инструментов
		const inst_xy=[[0,0],[70,0],[0,70],[70,70],[0,140],[70,140],[0,210],[70,210]];
		for (let i=0;i<my_data.inst.length;i++){
			const inst_id=my_data.inst[i];
			const inst_name=shop_data[inst_id].name;
			objects.inst_cards[i].visible=true;
			objects.inst_cards[i].pic.texture=gres[inst_name].texture;
			objects.inst_cards[i].x=inst_xy[i][0];
			objects.inst_cards[i].y=inst_xy[i][1];
			objects.inst_cards[i].name=inst_name;
		}
		
		//устанавливаем на текущей песне
		this.set_on_song(this.cur_song_id);
				
		objects.songs_cards_cont.y=0;				
		await anim2.add(objects.songs_cards_cont,{alpha:[0, 1]}, true, 1,'linear',false);
		
		objects.arrow_icon.y=345;		
		sound.play('arrow_end');
		await anim2.add(objects.arrow_icon,{x:[-200, 150]}, true, 1,'easeOutBounce');
		
		if(result==='win')
			await this.shift_up();		
		
		sound.play('note1');
		anim2.add(objects.inst_cont,{x:[-100, objects.inst_cont.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.up_button,{y:[-100, objects.up_button.sy]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.down_button,{x:[900, objects.down_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.back_button,{x:[-100, objects.back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.start_button,{x:[900, objects.start_button.sx]}, true, 0.5,'easeOutCubic');
		
	},

	check_vk_dialog(){		
		
		if(game_platform!=='VK')  return 'none';
		if(game_tick<150)  return 'none';
		
		if(Math.random()>0.5)
			return dialog.show('share');
		return dialog.show('invite_friends');
	},
	
	start_down(){
		
		if(anim2.any_on()){
			sound.play('locked2');
			return;				
		}
		
		
		const inst_name=songs_data[this.cur_song_id].inst;
		/*if (inst_name!==''){			
			const inst_id=shop_data.findIndex(inst=>inst.name===inst_name);
			const inst_name_rus=shop_data[inst_id].name_rus;
			if (my_data.inst.includes(inst_id)===false){
				message.add('Вам нужен инструмент: '+inst_name_rus);
				return;
			}			
		}	*/	
		

		sound.play('click');
		this.close();
		game.activate();
		
	},
		
	up_down(){			

		if(anim2.any_on()||this.cur_song_id===songs_data.length-1){
			sound.play('locked2');
			return;				
		}
		
		if(my_data.rating<this.cur_song_id+1){
			//sound.play('locked2');
			//return;				
		}		
				
		sound.play('click');
							
		
		//перемещаем последюю карточку вверх и обновляем ее
		const card_id_to_add=this.top_card.song_id+1;
		const songs_num=songs_data.length;
		
		if (this.bot_card.y===450 && card_id_to_add<songs_num){			
			this.bot_card.y=this.top_card.y-75;
			this.bot_card.set(this.top_card.song_id+1)		
			this.recalc_top_bottom_cards();				
		}
			
		
		//сдвигаем все
		for (let card of objects.songs_cards)
			anim2.add(card,{y:[card.y, card.y+75]}, true, 0.15,'linear');	
						
		this.cur_song_id++;

	},
	
	down_down(){	
		

		if(anim2.any_on()||!objects.songs_cards_cont.ready||this.cur_song_id===0){
			sound.play('locked2');
			return;				
		}

		sound.play('click');
		
		//перемещаем последюю карточку вверх и обновляем ее если она есть
		const card_id_to_add=this.bot_card.song_id-1;
		
		if (this.top_card.y===-75 && card_id_to_add>=0){
			this.top_card.y=this.bot_card.y+75;
			this.top_card.set(this.bot_card.song_id-1);				
			this.recalc_top_bottom_cards();			
		}
		
		//сдвигаем все
		for (let card of objects.songs_cards)
			anim2.add(card,{y:[card.y, card.y-75]}, true, 0.15,'linear');	
						
		this.cur_song_id--;
		
	},
	
	recalc_top_bottom_cards(){
		
		this.top_card = objects.songs_cards.reduce((prev, current) => {return prev.y < current.y ? prev : current});
		this.bot_card = objects.songs_cards.reduce((prev, current) => {return prev.y > current.y ? prev : current});
		objects.songs_cards.forEach(card=>{			
			card.lock.visible=my_data.rating<card.song_id;
		})
	},
	
	set_on_song(tar_id){		
		
		this.cur_song_id=tar_id;
		
		for (let i=0;i<8;i++){
			
			const song_id=tar_id+5-i;
			const top_y=75*(i-1);
			const free_card=objects.songs_cards[i];
			free_card.set(song_id);
			free_card.y=top_y;

			if (i===0) this.top_card=free_card;			
			if (i===7) this.bot_card=free_card;

		}
		
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
	
	inst_down(){		
		
		objects.inst_frame.x=this.x;
		objects.inst_frame.y=this.y;
		objects.inst_frame.visible=true;
		play_menu.instrument=this.name;
		sound.play('click');
	},
	
	async load_avatar(card){		
		
		console.log('пытаемся загрузить ',card.artist_eng)
		if (avatar_loader.loading){
			await new Promise(resolve => setTimeout(resolve, 250));
			play_menu.load_avatar(card);
			return;
			
			
		}
		
		const artist_eng=card.artist_eng;
		
		//если уже есть
		if (avatar_loader.resources[artist_eng]){
			if (card.artist_eng===artist_eng)
				card.avatar.texture=avatar_loader.resources[artist_eng].texture;	
			return;
		}
		
		avatar_loader.add(artist_eng,git_src+'artists/'+artist_eng+'.jpg');
		console.log('загружаем... ',card.artist_eng)
		await new Promise(resolve=> avatar_loader.load(resolve))
		console.log('готово!',card.artist_eng)
		//если карточка все еще ждет того-же артиста
		if (card.artist_eng===artist_eng)
			card.avatar.texture=avatar_loader.resources[artist_eng].texture;			
		
	},
		
	close(){
		
		objects.inst_cont.visible=false;
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
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;-webkit-touch-callout: none;-webkit-user-select: none;user-select: none;}body {display: flex;align-items: center;justify-content: center;background-color: rgba(41,41,41,1);flex-direction: column	}#m_progress {	  background: #1a1a1a;	  justify-content: flex-start;	  border-radius: 5px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset;	  border-radius: 5px;	  background: rgb(119, 119, 119);	  height: 70%;	  width: 0%;	}	</style></div><div id="m_progress">  <div id="m_bar"></div></div>';
	
	
	await load_resources();
	audio_context = new (window.AudioContext || window.webkitAudioContext)();	
		
	//создаем приложение пикси и добавляем тень	
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer({width:M_WIDTH, height:M_HEIGHT,antialias:true});
	document.body.appendChild(app.renderer.view).style["boxShadow"] = "0 0 15px #000000";
	document.body.style.backgroundColor = 'rgb(141,211,200)';

	//доп функция для текста битмап
	PIXI.BitmapText.prototype.set2=function(text,w){		
		const t=this.text=text;
		for (i=t.length;i>=0;i--){
			this.text=t.substring(0,i)
			if (this.width<w) return;
		}	
	}



	//запускаем главный цикл
	main_loop();

	resize();
	window.addEventListener("resize", resize);	
	
	//window.addEventListener('keydown', function(event) { game.key_down(event)});
		
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

	//коротко файрбейс
	fbs=firebase.database();

	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}
	
	//ждем пока загрузится аватар
	const loader=new PIXI.Loader();
	loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});			
	await new Promise((resolve, reject)=> loader.load(resolve))	
	
			
	//получаем остальные данные об игроке
	const _other_data = await firebase.database().ref("players/"+my_data.uid).once('value');
	const other_data = _other_data.val();
	
	//определяем рейтинг
	my_data.rating = (other_data && other_data.rating) || 0;
	my_data.money=(other_data && other_data.money) || 0;
	my_data.inst=(other_data && other_data.inst) || [0];
	//my_data.inst=[0,1,2,3,4,5];
	play_menu.cur_song_id=my_data.rating;

	//убираем лупу
	objects.id_loup.visible=false;

	//устанавлием имена
	make_text(objects.id_name,my_data.name,150);
	
	//устанавливаем рейтинг в попап
	objects.id_rating.text=my_data.rating;

	//обновляем данные в файербейс так как могли поменяться имя или фото
	firebase.database().ref("players/"+my_data.uid).set({name:my_data.name, pic_url: my_data.pic_url, rating : my_data.rating, money : my_data.money, inst : my_data.inst, tm:firebase.database.ServerValue.TIMESTAMP});

	//заносим время в файербейс
	firebase.database().ref('time').set(firebase.database.ServerValue.TIMESTAMP);

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

function main_loop() {



	game_tick+=0.016666666;
	
	//обрабатываем минипроцессы
	for (let key in some_process)
		some_process[key]();	
	
	anim2.process();

	app.renderer.render(app.stage);		
	requestAnimationFrame(main_loop);	
}

