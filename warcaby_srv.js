var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

  
server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/warcaby_multi.php');
});
io.configure(function () { 
  io.set('transports', ['websocket']);
   io.set("polling duration", 20); 
});



var ilosc_graczy=0;
var gracz1_name=false;
var gracz2_name=false;
var plansza=false;
var msg;
function Game_Object(plansza_,gracz1_name_,gracz2_name_)
{
	this.plansza=plansza_;
	this.gracz1_name=gracz1_name_;
	this.gracz2_name=gracz2_name_;
}
function wygrana_object(graczz,wiad)
{
	this.gracz=graczz;
	this.wiadomosc=wiad;
}
io.sockets.on('connection', function (socket) 
{
	ilosc_graczy++;
	console.log('Ilosc graczy: '+ilosc_graczy);
	socket.broadcast.emit('liczba_graczy', { ilosc_graczy: ilosc_graczy });	
		
	socket.on('disconnect', function () 
	{	
		gracz1_name=false;
		gracz2_name=false;
		ilosc_graczy--;
		console.log('Gracz się rozłaczył');
		socket.broadcast.emit('liczba_graczy', { ilosc_graczy: ilosc_graczy });	
		io.sockets.emit('reset', { wiadomosc: 'reset' });
		
	});
	
	socket.on('reset', function (data) 
	{
		var w_msg=false;
		if(data.wiadomosc.wiadomosc=='wygrana')
		{
		console.log('dostalo wygrana');
		w_msg= new wygrana_object(data.wiadomosc.gracz,'wygrana');
		io.sockets.emit('reset', { wiadomosc: w_msg });
		}
		else if(data.wiadomosc.wiadomosc=='poddanie')
		{
		w_msg= new wygrana_object(data.wiadomosc.gracz,'poddanie');
		io.sockets.emit('reset', { wiadomosc: w_msg });
		}
		socket.broadcast.emit('liczba_graczy', { ilosc_graczy: ilosc_graczy });	
	});
	
	socket.on('stan_gry', function (data) 
	{
		gracz1_name=data.wiadomosc.gracz1_name;
		gracz2_name=data.wiadomosc.gracz2_name;
		msg = new Game_Object(false, gracz1_name,gracz2_name);
		socket.broadcast.emit('stan_gry', { wiadomosc: msg });	
		
	});
	
	socket.on('rozpocznij_gre', function (data) 
	{
		if(data.wiadomosc.plansza==false)
		{
			msg = new Game_Object(false, gracz1_name,gracz2_name);
			io.sockets.emit('rozpocznij_gre', { wiadomosc: msg });	
		}
		else
		{	
		
			plansza=data.wiadomosc.plansza;
			msg = new Game_Object(plansza, gracz1_name,gracz2_name);
			socket.broadcast.emit('rozpocznij_gre', { wiadomosc: msg });	
		
		}
		
	});
	
	socket.on('wymus_remis', function (data) 
	{

		socket.broadcast.emit('remis', { wiadomosc: "null" });	

	});
	
});
  

