var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next')
var $barPlayPause = $('.main-controls .play-pause');

var currentAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var setCurrentTimeInPlayerBar = function(currentTime) {
  $('.current-time').text(filterTimeCode(currentTime));
}

var setTotalTimeInPlayerBar = function(totalTime) {
  $('.total-time').text(filterTimeCode(totalTime));
}

var filterTimeCode = function(timeInSeconds) {
  var timeInSecondsNumber = parseFloat(timeInSeconds);
  var secs = ('0' + Math.floor(timeInSeconds%60)).slice(-2);
  return Math.floor(timeInSecondsNumber/60) + ':' + secs;
}

var updatePlayerBarSong = function() {
  var songTitle = (currentSongFromAlbum !== null) ? currentSongFromAlbum.title : null;
  var artistTitle = (currentSongFromAlbum !== null) ? currentAlbum.artist : null;
  var songAndArtist = (songTitle !== null) ? songTitle + ' - ' + artistTitle : null;
  var songDuration = (currentSongFromAlbum !== null) ? currentSongFromAlbum.duration : null;

  $('.currently-playing .song-name').text(songTitle);
  $('.currently-playing .artist-name').text(artistTitle);
  $('.currently-playing .artist-song-mobile').text(songAndArtist);
  setTotalTimeInPlayerBar(songDuration);

  (currentSongFromAlbum !== null && !(currentSoundFile.isPaused())) ? $barPlayPause.html(playerBarPauseButton) : $barPlayPause.html(playerBarPlayButton);
};


var nextPrevSong = function(e) {

  if (!(currentlyPlayingSongNumber)) return;
  getSongNumberCell(currentlyPlayingSongNumber).html(currentlyPlayingSongNumber);
  var newSongNumber = null;

  if ($nextButton[0]==$(this)[0]) {
    newSongNumber = currentlyPlayingSongNumber%currentAlbum.songs.length;
    setSong(++newSongNumber);
  } else if ($previousButton[0]==$(this)[0]) {
    newSongNumber = (--currentlyPlayingSongNumber) ? currentlyPlayingSongNumber : currentAlbum.songs.length;
    setSong(newSongNumber);
  }
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  getSongNumberCell(currentlyPlayingSongNumber).html(pauseButtonTemplate);
  updatePlayerBarSong();
};



var createSongRow = function(songNumber, songName, songLength) {
  var template =
      '<tr class="album-view-song-item">'
    + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
    + '  <td class="song-item-title">' + songName + '</td>'
    + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
    + '</tr>'
    ;

  var $row = $(template);


  var clickHandler = function(e) {

    var songNum = parseInt($(this).attr('data-song-number'));

    if (currentlyPlayingSongNumber === null) {
      $(this).html(pauseButtonTemplate);
      setSong(songNum);
      setVolume(currentVolume);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
    } else if (currentlyPlayingSongNumber === songNum) {
      if (currentSoundFile.isPaused()) {
        $(this).html(pauseButtonTemplate);
        setVolume(currentVolume);
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
      } else {
        $(this).html(playButtonTemplate);
        currentSoundFile.pause();
      }
    }
    else if (currentlyPlayingSongNumber !== songNum) {
      var $currentlyPlayingSongElement = getSongNumberCell(currentlyPlayingSongNumber);
      $currentlyPlayingSongElement.html(currentlyPlayingSongNumber);
      $(this).html(pauseButtonTemplate);
      setSong(songNum);
      setVolume(currentVolume);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
    }
    updatePlayerBarSong();
  };

  var onHover = function(event) {

    $sItem = $(this).find('.song-item-number');
    sNum = parseInt($sItem.attr('data-song-number'));
    if (sNum !== currentlyPlayingSongNumber) {
      $sItem.html(playButtonTemplate);
    }
  };
  var offHover = function(event) {

    $sItem = $(this).find('.song-item-number');
    sNum = parseInt($sItem.attr('data-song-number'));
    if (sNum !== currentlyPlayingSongNumber) {
      $sItem.html(sNum);
    }
  };
  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};

var setCurrentAlbum = function(album) {

  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  }
};

var updateSeekBarWhileSongPlays = function() {
  if (currentSoundFile) {
    currentSoundFile.bind('timeupdate', function(event) {
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      updateSeekPercentage($seekBar, seekBarFillRatio);
      setCurrentTimeInPlayerBar(this.getTime());
    });
  }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
  return offsetXPercent;
};

var setupSeekBars = function() {
  updateSeekPercentage($('.player-bar .volume .seek-bar'), currentVolume/100);
  updateSeekPercentage($('.player-bar .seek-control .seek-bar'), 0);

  var $seekBars = $('.player-bar .seek-bar');
  $seekBars.click(function(event) {
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;
    var seekPerc = updateSeekPercentage($(this), seekBarFillRatio);
    if ($(this).parent(".volume").length) {
      currentVolume = seekPerc;
      setVolume(currentVolume);
    } else if ($(this).parent('.seek-control').length) {
      if (currentSoundFile) seek(currentSoundFile.getDuration()*seekBarFillRatio);
    }

  });

  $seekBars.find('.thumb').mousedown(function(event) {
    var $seekBar = $(this).parent();
    $(document).bind('mousemove.thumb', function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;
      var seekPerc = updateSeekPercentage($seekBar, seekBarFillRatio);
      if ($seekBar.parent(".volume").length) {
        currentVolume = seekPerc;
        setVolume(currentVolume);
      } else if ($seekBar.parent('.seek-control').length) {
        if (currentSoundFile) seek(currentSoundFile.getDuration()*seekBarFillRatio);
      }
    });
    $(document).bind('mouseup.thumb', function() {
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });
  });

};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var setSong = function(songNumber) {

  if (currentSoundFile) {
      currentSoundFile.stop();
  }
  if (songNumber) {
    currentlyPlayingSongNumber = songNumber;
    currentSongFromAlbum = currentAlbum.songs[songNumber-1];
  } else {
    currentlyPlayingSongNumber = null;
    currentSongFromAlbum = null;
  }
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3' ],
    preload: true
  });

  setVolume(currentVolume);
}

var seek = function(time) {
  if (currentSoundFile) currentSoundFile.setTime(time);
}

var setVolume = function(volume) {
  if (currentSoundFile) currentSoundFile.setVolume(volume);
}

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
}

var toggleFromPlayerBar = function() {

  if (currentlyPlayingSongNumber === null) {
    setSong(1);
  }

  var songNumberCell = getSongNumberCell(currentlyPlayingSongNumber);

  if (currentSoundFile.isPaused()) {
    $(songNumberCell).html(pauseButtonTemplate);
    $barPlayPause.html(playerBarPauseButton);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();

  } else {
    $(songNumberCell).html(playButtonTemplate);
    $barPlayPause.html(playerBarPlayButton);
    currentSoundFile.pause();
  }
  updatePlayerBarSong();

}

$('document').ready(function() {

  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $nextButton.click(nextPrevSong);
  $previousButton.click(nextPrevSong);
  $barPlayPause.click(toggleFromPlayerBar);
});
