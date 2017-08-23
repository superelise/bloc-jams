// Album button templates
 var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
 var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
 var playerBarPlayButton = '<span class="ion-play"></span>';
 var playerBarPauseButton = '<span class = "ion-pause"></span>';

 // Store state of playing songs
 var currentAlbum = null;
 var currentlyPlayingSongNumber = null;
 var currentSongFromAlbum = null;
 var currentSoundFile = null;
 // Set song volume
 var currentVolume = 80;

 // Add event handlers
 var $previousButton = $('.main-controls .previous');
 var $nextButton = $('.main-controls .next');

var setSong = function(songNumber) {
    // Prevent multiple songs from playing concurrently
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1]
    // Assign a new Buzz sound object
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        //two defined properties
        formats: ['mp3'],
        preload: true
    });
    
    // Set song volume
    setVolume(currentVolume);
};

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};


var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
}
    
    
var createSongRow = function(songNumber, songName, songLength) {
    var template =
        '<tr class ="album-view-song-item">'+
        '<td class ="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'+
        '<td class = "song-item-title">' + songName + '</td>'+
        '<td class = "song-item-duration">' + songLength + '</td>'
        '</tr>'
    ;

    var $row = $(template);

    var clickHandler = function() {
    	var songNumber = $(this).attr('data-song-number');

    	if (currentlyPlayingSongNumber !== null) {
    		// Revert to song number for currently playing song because user started playing new song.
    		var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
    		currentlyPlayingCell.html(currentlyPlayingSongNumber);
    	}
    	if (currentlyPlayingSongNumber !== songNumber) {
    		// Switch from Play -> Pause button to indicate new song is playing.
    		$(this).html(pauseButtonTemplate);
    		setSong(songNumber);
            currentSoundFile.play();
    	} else if (currentlyPlayingSongNumber === songNumber) {
            
            if (currentSoundFile.isPaused()){
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.pause();
            }
            
    	}
    };

    var onHover = function(event) {
          var songNumberCell = $(this).find('.song-item-number');
          var songNumber = songNumberCell.attr('data-song-number');

          if (songNumber !== currentlyPlayingSongNumber) {
              songNumberCell.html(playButtonTemplate);
          }
      };

      var offHover = function(event) {
          var songNumberCell = $(this).find('.song-item-number');
          var songNumber = songNumberCell.attr('data-song-number');

          if (songNumber !== currentlyPlayingSongNumber) {
              songNumberCell.html(songNumber);
          }
      };

$row.find('.song-item-number').click(clickHandler);
$row.hover(onHover, offHover);
return $row;
};

var setCurrentAlbum = function(album) {
     currentAlbum = album;
     // #1
     var $albumTitle = $('.album-view-title');
     var $albumArtist = $('.album-view-artist');
     var $albumReleaseInfo = $('.album-view-release-info');
     var $albumImage = $('.album-cover-art');
     var $albumSongList = $('.album-view-song-list');
 
     // #2
     $albumTitle.text(album.title);
     $albumArtist.text(album.artist);
     $albumReleaseInfo.text(album.year + ' ' + album.label);
     $albumImage.attr('src', album.albumArtUrl);
 
     // #3
     $albumSongList.empty();
 
     // #4
     for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
         $albumSongList.append($newRow);
     }
 }; 


// Update Player Bar Song
var updatePlayerBarSong = function() {
    
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
};

// Track the index of the current song
var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

// Next song function
var nextSong = function() {
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Incrementing the index of song
    currentSongIndex++;
    
    if (currentSongIndex >= currentAlbum.songs.length){
        currentSongIndex = 0;
    }

    
    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;

    // Set a new current song
    setSong (currentSongIndex + 1);
    // Play songs when skipping
    currentSoundFile.play();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];

    // Update the Player Bar information
    updatePlayerBarSong();

    var $nextSongNumberCell = $('.song-item-number[data-song-number=" ' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="'+lastSongNumber+'"]');

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);

};


// Previous song function
var previousSong = function() {
    var currentSongIndex = trackIndex (currentAlbum, currentSongFromAlbum);
    // Decrementing the index of song
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.length - 1;
    }
    
    // Save the last song number before changing it
    var lastSongNumber = currentlyPlayingSongNumber;
    
    // Set a new current song
    setSong (currentSongIndex + 1);
    // Play songs when skipping
    currentSoundFile.play();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
    
    // Update the Player Bar information
    updatePlayerBarSong();
    
    
    var $previousSongNumberCell = $('.song-item-number[data-song-number="'+currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
};


 $(document).ready(function() {
     setCurrentAlbum(albumPicasso);
     $previousButton.click(previousSong);
     $nextButton.click(nextSong);
 });
