window.onload = function() {

    const audioContext = new AudioContext();

    const buffer = audioContext.createBuffer(
        1,
        audioContext.sampleRate * 1,
        audioContext.sampleRate,
    );
    
    const channelData = buffer.getChannelData(0);

    for(let i = 0; i < buffer.length; i++) {
        channelData[i] = Math.random() * 2 - 1;
    }

    // SOROLL
    const primaryGainControl = audioContext.createGain();
    primaryGainControl.gain.setValueAtTime(0.05, 0);
    primaryGainControl.connect(audioContext.destination);

    const button = document.createElement('button');
    button.innerText = "Soroll";

    button.addEventListener('click', () => {
        const whiteNoiseSource = audioContext.createBufferSource();
        whiteNoiseSource.buffer = buffer;
        whiteNoiseSource.connect(primaryGainControl);
        whiteNoiseSource.start();
    });
    document.body.appendChild(button);

    // SNARE
    const snareFilter = audioContext.createBiquadFilter();
    snareFilter.type = "highpass";
    snareFilter.frequency.value = 1500;
    snareFilter.connect(primaryGainControl);

    const snareButton = document.createElement('button');
    snareButton.innerText = "Snare";

    snareButton.addEventListener('click', () => {
        const whiteNoiseSource = audioContext.createBufferSource();
        whiteNoiseSource.buffer = buffer;
        whiteNoiseSource.connect(snareFilter);

        const whiteNoiseGain = audioContext.createGain();
        whiteNoiseGain.gain.setValueAtTime(1, audioContext.currentTime);
        whiteNoiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        whiteNoiseSource.connect(whiteNoiseGain);
        whiteNoiseGain.connect(snareFilter);

        whiteNoiseSource.start();
        whiteNoiseSource.stop(audioContext.currentTime + 0.2); 

        const snareOscilator = audioContext.createOscillator();
        snareOscilator.type = "triangle";
        snareOscilator.frequency.setValueAtTime(250, audioContext.currentTime);

        const oscillatorGain = audioContext.createGain();
        oscillatorGain.gain.setValueAtTime(1, audioContext.currentTime);
        oscillatorGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        snareOscilator.connect(oscillatorGain);
        oscillatorGain.connect(primaryGainControl);
        snareOscilator.start();
        snareOscilator.stop(audioContext.currentTime + 0.2)
    });
    document.body.appendChild(snareButton);

    // KICK
    const kickButton = document.createElement('button');
    kickButton.innerText = "Kick";

    kickButton.addEventListener('click', () => {
        const kickOscillator = audioContext.createOscillator();

        kickOscillator.frequency.setValueAtTime(266.1, 0);
        
        kickOscillator.frequency.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

        const kickGain = audioContext.createGain();
        kickGain.gain.setValueAtTime(1, 0);
        kickGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

        kickOscillator.connect(primaryGainControl);
        kickGain.connect(primaryGainControl);
        kickOscillator.start();
        kickOscillator.stop(audioContext.currentTime + 2);
    });
    document.body.appendChild(kickButton);

    // NOTES
    const notes = [
        { name: 'C', frequency: 261.63 },
        { name: 'C#', frequency: 277.18 },
        { name: 'D', frequency: 293.66 },
        { name: 'D#', frequency: 311.13 },
        { name: 'E', frequency: 329.63 },
        { name: 'F', frequency: 349.23 },
        { name: 'F#', frequency: 369.99 },
        { name: 'G', frequency: 392.0 },
        { name: 'G#', frequency: 415.3 },
        { name: 'A', frequency: 440.0 },
        { name: 'A#', frequency: 466.16 },
        { name: 'B', frequency: 493.88 },
        { name: 'C', frequency: 523.25 }
    ];

}