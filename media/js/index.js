$(function(){
    var playerContent1 = $('#player-content1');// 歌曲信息模块部分dom元素
    var musicName = $('.music-name');          // 歌曲名部分dom元素 
    var artistName = $('.artist-name');        // 歌手名部分dom元素
    
    var musicImgs = $('.music-imgs');          // 左侧封面图dom元素
  
    var playPauseBtn = $('.play-pause');       // 播放/暂停按钮 dom元素
    var playPrevBtn = $('.prev');              // 上一首按钮 dom元素
    var playNextBtn = $('.next')               // 下一首按钮 dom元素
    
    var time = $('.time');                     // 时间信息部分 dom元素
    var tProgress = $('.current-time');        // 当前播放时间文本部分 dom元素
    var totalTime = $('.total-time');          // 歌曲总时长文本部分 dom元素
    
    var sArea = $('#s-area');                  // 进度条部分
    var insTime = $('#ins-time');              // 鼠标移动至进度条上面，显示的信息部分
    var sHover = $('#s-hover');                // 鼠标移动至进度条上面，前面变暗的进度条部分
    var seekBar = $('#seek-bar');              // 播放进度条部分
    
    // 一些计算所需的变量
    var seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime = 0
    var musicImgsData = ['img/bg.jpg','img/bg1.jpg','img/bg2.jpg']    // 图片地址数组
    var musicNameData = ['出山','盗将行','归去来兮'];                   // 歌曲名数组
    var artistNameData = ['花粥/王胜娚','花粥/马雨阳','花粥']            // 创作歌手数组
    var musicUrls=['mp3/music1.mp3','mp3/music2.mp3','mp3/music3.mp3'];// 歌曲mp3数组
    var currIndex = -1;              // 当前播放索引
    
    var buffInterval = null          // 初始化定时器 判断是否需要缓冲
    var len = musicNameData.length;  // 歌曲长度
 

    // 点击 播放/暂停 按钮，触发该函数
    // 作用：根据audio的paused属性 来检测当前音频是否已暂停  true:暂停  false:播放中
    function playPause(){
        if(audio.paused){
            playerContent1.addClass('active'); // 内容栏上移
            musicImgs.addClass('active');      // 左侧图片开始动画效果
            playPauseBtn.attr('class','btn play-pause icon-zanting iconfont') // 显示暂停图标
            checkBuffering(); // 检测是否需要缓冲
            audio.play();     // 播放
        }else{
            playerContent1.removeClass('active'); // 内容栏下移
            musicImgs.removeClass('active');      // 左侧图片停止旋转等动画效果
            playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放按钮
            clearInterval(buffInterval);          // 清除检测是否需要缓冲的定时器
            musicImgs.removeClass('buffering');    // 移除缓冲类名
            audio.pause(); // 暂停
        }  
    }


    // 鼠标移动在进度条上， 触发该函数	
	function showHover(event){
		seekBarPos = sArea.offset();    // 获取进度条长度
		seekT = event.clientX - seekBarPos.left;  //获取当前鼠标在进度条上的位置
		seekLoc = audio.duration * (seekT / sArea.outerWidth()); //当前鼠标位置的音频播放秒数： 音频长度(单位：s)*（鼠标在进度条上的位置/进度条的宽度）
		
		sHover.width(seekT);  //设置鼠标移动到进度条上变暗的部分宽度
		
		cM = seekLoc / 60;    // 计算播放了多少分钟： 音频播放秒速/60
		
		ctMinutes = Math.floor(cM);  // 向下取整
		ctSeconds = Math.floor(seekLoc - ctMinutes * 60); // 计算播放秒数
		
		if( (ctMinutes < 0) || (ctSeconds < 0) )
			return;
		
        if( (ctMinutes < 0) || (ctSeconds < 0) )
			return;
		
		if(ctMinutes < 10)
			ctMinutes = '0'+ctMinutes;
		if(ctSeconds < 10)
			ctSeconds = '0'+ctSeconds;
        
        if( isNaN(ctMinutes) || isNaN(ctSeconds) )
            insTime.text('--:--');
        else
		    insTime.text(ctMinutes+':'+ctSeconds);  // 设置鼠标移动到进度条上显示的信息
            
		insTime.css({'left':seekT,'margin-left':'-21px'}).fadeIn(0);  // 淡入效果显示
		
	}

    // 鼠标移出进度条，触发该函数
    function hideHover()
	{
        sHover.width(0);  // 设置鼠标移动到进度条上变暗的部分宽度 重置为0
        insTime.text('00:00').css({'left':'0px','margin-left':'0px'}).fadeOut(0); // 淡出效果显示
    }

    // 鼠标点击进度条，触发该函数
    function playFromClickedPos()
    {
        audio.currentTime = seekLoc; // 设置音频播放时间 为当前鼠标点击的位置时间
		seekBar.width(seekT);        // 设置进度条播放长度，为当前鼠标点击的长度
		hideHover();                 // 调用该函数，隐藏原来鼠标移动到上方触发的进度条阴影
    }

    // 在音频的播放位置发生改变是触发该函数
    function updateCurrTime()
	{
        nTime = new Date();      // 获取当前时间
        nTime = nTime.getTime(); // 将该时间转化为毫秒数

        // 计算当前音频播放的时间
		curMinutes = Math.floor(audio.currentTime  / 60);
        curSeconds = Math.floor(audio.currentTime  - curMinutes * 60);
        
		// 计算当前音频总时间
		durMinutes = Math.floor(audio.duration / 60);
        durSeconds = Math.floor(audio.duration - durMinutes * 60);
        
		// 计算播放进度百分比
		playProgress = (audio.currentTime  / audio.duration) * 100;
        
        // 如果时间为个位数，设置其格式
		if(curMinutes < 10)
			curMinutes = '0'+curMinutes;
		if(curSeconds < 10)
			curSeconds = '0'+curSeconds;
		
		if(durMinutes < 10)
			durMinutes = '0'+durMinutes;
		if(durSeconds < 10)
			durSeconds = '0'+durSeconds;
        
        if( isNaN(curMinutes) || isNaN(curSeconds) )
            tProgress.text('00:00');
        else
            tProgress.text(curMinutes+':'+curSeconds);
        
        if( isNaN(durMinutes) || isNaN(durSeconds) )
            totalTime.text('00:00');
        else
		    totalTime.text(durMinutes+':'+durSeconds);
        
        if( isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds) )
            time.removeClass('active');
        else
            time.addClass('active');

        // 设置播放进度条的长度
		seekBar.width(playProgress+'%');
        
        // 进度条为100 即歌曲播放完时
		if( playProgress == 100 )
		{
            playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放按钮
			seekBar.width(0);              // 播放进度条重置为0
            tProgress.text('00:00');       // 播放时间重置为 00:00
            musicImgs.removeClass('buffering').removeClass('active');  // 移除相关类名
            clearInterval(buffInterval);   // 清除定时器

            selectTrack(1);  // 添加这一句，可以实现自动播放
		}
    }

    // 定时器检测是否需要缓冲
    function checkBuffering(){
        clearInterval(buffInterval);
        buffInterval = setInterval(function()
        { 
            // 这里如果音频播放了，则nTime为当前时间毫秒数，如果没播放则为0；如果时间间隔过长，也将缓存
            if( (nTime == 0) || (bTime - nTime) > 1000  ){ 
                musicImgs.addClass('buffering');  // 添加缓存样式类
            } else{
                musicImgs.removeClass('buffering'); // 移除缓存样式类
            }
                
            bTime = new Date();
            bTime = bTime.getTime();

        },100);
    }
   
    // 点击上一首/下一首时，触发该函数。 
    //注意：后面代码初始化时，会触发一次selectTrack(0)，因此下面一些地方需要判断flag是否为0
    function selectTrack(flag){
        if( flag == 0 || flag == 1 ){  // 初始 || 点击下一首
            ++ currIndex;
            if(currIndex >=len){      // 当处于最后一首时，点击下一首，播放索引置为第一首
                currIndex = 0;
            }
        }else{                    // 点击上一首
            --currIndex;
            if(currIndex<=-1){    // 当处于第一首时，点击上一首，播放索引置为最后一首
                currIndex = len-1;
            }
        }

        if( flag == 0 ){
            playPauseBtn.attr('class','btn play-pause icon-jiediankaishi iconfont'); // 显示播放图标
        }else{
            musicImgs.removeClass('buffering');   
            playPauseBtn.attr('class','btn play-pause icon-zanting iconfont') // 显示暂停图标
        }

        seekBar.width(0);           // 重置播放进度条为0
        time.removeClass('active');
        tProgress.text('00:00');    // 播放时间重置
        totalTime.text('00:00');    // 总时间重置

        // 获取当前索引的:歌曲名，歌手名，图片，歌曲链接等信息
        currMusic = musicNameData[currIndex];
        currArtist = artistNameData[currIndex];
        currImg = musicImgsData[currIndex];
        audio.src = musicUrls[currIndex];
        
        nTime = 0;
        bTime = new Date();
        bTime = bTime.getTime();

        // 如果点击的是上一首/下一首 则设置开始播放，添加相关类名，重新开启定时器
        if(flag != 0){
            audio.play();
            playerContent1.addClass('active');
            musicImgs.addClass('active');
        
            clearInterval(buffInterval);
            checkBuffering();
        }

        // 将歌手名，歌曲名，图片链接，设置到元素上
        artistName.text(currArtist);
        musicName.text(currMusic);
        musicImgs.find('.img').css({'background':'url('+currImg+')'})
        
    }


    // 初始化函数
    function initPlayer() {
        audio = new Audio();  // 创建Audio对象
		selectTrack(0);       // 初始化第一首歌曲的相关信息
		audio.loop = false;   // 取消歌曲的循环播放功能
		
        playPauseBtn.on('click',playPause); // 点击播放/暂停 按钮，触发playPause函数
        
		// 进度条 移入/移出/点击 动作触发相应函数
		sArea.mousemove(function(event){ showHover(event); }); 
        sArea.mouseout(hideHover);
        sArea.on('click',playFromClickedPos);
        
        // 实时更新播放时间
        $(audio).on('timeupdate',updateCurrTime); 

        // 上下首切换
        playPrevBtn.on('click',function(){ selectTrack(-1);} );
        playNextBtn.on('click',function(){ selectTrack(1);});
    }

    // 调用初始化函数
    initPlayer();

});



// 获取显示文字的span元素
const textEl = document.querySelector("#text");
// 获取并解析要展示的文本数组
const texts = JSON.parse(textEl.getAttribute("data-text"));

// 当前显示文本数组中的第几个
let index = 0;
// 当前显示第几个字
let charIndex = 0;
// 每个字显示间隔默认是500毫秒
let delta = 250;

// 记录动画执行开始时间
let start = null;
// 是否为删除动画
let isDeleting = false;

//定时器，设置10秒后自动跳转

// 动画回调函数
function type(time) {
    window.requestAnimationFrame(type);
    // 初始化开始时间
    if (!start) start = time;
    // 获取时间间隔
    let progress = time - start;
    // 每隔一定的时间，打印出一个新的字符
     if (progress > delta) {
        // 获取完整的字符
        let text = texts[index];
        // 如果是打字效果
        if (!isDeleting) {
            // 给展示文字的span新增一个字符，使用innerHTML来替换，charIndex自增1，然后返回新的字符串子串
            textEl.innerHTML = text.slice(0, ++charIndex);
        } else {
            // 如果是删除效果，则把文字一个一个减掉
          
        }
        // 把star更新为当前时间，进行下一个周期
        start = time;

        // 如果文字已经全部打印完毕
        if (charIndex === text.length) {
            // 下次开始删除文字
            isDeleting = true;

            // 删除文字的间隔为200毫秒
            delta = 85;
            // 额外等待1.2秒后再删除
            start = time + 500;
        }

        // 如果文字删除完毕
        if (charIndex < 0) {
            isDeleting = false;
            // 额外增加200毫秒延迟
            start = time + 200;
            // 把index移动到下一个文本，并且在文本数组元素个数中循环
            index = ++index;
        }

     }
}

window.requestAnimationFrame(type);
