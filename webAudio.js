export default class WebAudio {

    constructor() {
        this.audioContext = new AudioContext();
        this.notes = [
            { name: 'Do', frequency: 261.63 },
            { name: 'Do#', frequency: 277.18, color: '#FFF' },
            { name: 'Re', frequency: 293.66 },
            { name: 'Re#', frequency: 311.13 },
            { name: 'Mi', frequency: 329.63 },
            { name: 'Fa', frequency: 349.23 },
            { name: 'Fa#', frequency: 369.99 },
            { name: 'Sol', frequency: 392.0 },
            { name: 'Sol#', frequency: 415.3 },
            { name: 'La', frequency: 440.0 },
            { name: 'La#', frequency: 466.16 },
            { name: 'Si', frequency: 493.88 },
            { name: 'Do', frequency: 523.25 }
        ];
        this.buffer = this.audioContext.createBuffer(
            1,
            this.audioContext.sampleRate * 1,
            this.audioContext.sampleRate,
        );
        this.primaryGainControl = this.audioContext.createGain();
        this.recording = false;
        this.recordedNotes = new Array();
    }

    start() {        
        const channelData = this.buffer.getChannelData(0);
    
        for(let i = 0; i < this.buffer.length; i++) {
            channelData[i] = Math.random() * 2 - 1;
        }

        this.createNoise();
        this.createSnare();
        this.createKick();
        this.recordNotes();
        this.stopRecording();
        this.playNotes();
        this.createNotesScale();

    }

    createNoise() {
        const primaryGainControl = this.primaryGainControl;
        primaryGainControl.gain.setValueAtTime(0.05, 0);
        primaryGainControl.connect(this.audioContext.destination);
    
        const button = document.createElement('button');
        button.innerText = "Soroll";
        button.className = 'exampleButton';
    
        button.addEventListener('click', () => {
            const whiteNoiseSource = this.audioContext.createBufferSource();
            whiteNoiseSource.buffer = this.buffer;
            whiteNoiseSource.connect(primaryGainControl);
            whiteNoiseSource.start();
        });
        document.getElementById('examples').appendChild(button);
    }

    createSnare() {
        const primaryGainControl = this.primaryGainControl;
        const snareFilter = this.audioContext.createBiquadFilter();
        snareFilter.type = "highpass";
        snareFilter.frequency.value = 1500;
        snareFilter.connect(primaryGainControl);
    
        const snareButton = document.createElement('button');
        snareButton.innerText = "Snare";
        snareButton.className = 'exampleButton';
    
        snareButton.addEventListener('click', () => {
            const whiteNoiseSource = this.audioContext.createBufferSource();
            whiteNoiseSource.buffer = this.buffer;
            whiteNoiseSource.connect(snareFilter);
    
            const whiteNoiseGain = this.audioContext.createGain();
            whiteNoiseGain.gain.setValueAtTime(1, this.audioContext.currentTime);
            whiteNoiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            whiteNoiseSource.connect(whiteNoiseGain);
            whiteNoiseGain.connect(snareFilter);
    
            whiteNoiseSource.start();
            whiteNoiseSource.stop(this.audioContext.currentTime + 0.2); 
    
            const snareOscilator = this.audioContext.createOscillator();
            snareOscilator.type = "triangle";
            snareOscilator.frequency.setValueAtTime(250, this.audioContext.currentTime);
    
            const oscillatorGain = this.audioContext.createGain();
            oscillatorGain.gain.setValueAtTime(1, this.audioContext.currentTime);
            oscillatorGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            snareOscilator.connect(oscillatorGain);
            oscillatorGain.connect(primaryGainControl);
            snareOscilator.start();
            snareOscilator.stop(this.audioContext.currentTime + 0.2)
        });
        document.getElementById('examples').appendChild(snareButton);
    }

    createKick() {
        const primaryGainControl = this.primaryGainControl;
        const kickButton = document.createElement('button');
        kickButton.innerText = "Kick";
        kickButton.className = 'exampleButton';
    
        kickButton.addEventListener('click', () => {
            const kickOscillator = this.audioContext.createOscillator();
    
            kickOscillator.frequency.setValueAtTime(266.1, 0);
            
            kickOscillator.frequency.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
    
            const kickGain = this.audioContext.createGain();
            kickGain.gain.setValueAtTime(1, 0);
            kickGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
    
            kickOscillator.connect(primaryGainControl);
            kickGain.connect(primaryGainControl);
            kickOscillator.start();
            kickOscillator.stop(this.audioContext.currentTime + 2);
        });
        document.getElementById('examples').appendChild(kickButton);
    }

    recordNotes() {
        const recordButton = document.createElement('button');
        recordButton.innerHTML = 'Grabar';
        recordButton.className = this.recording ? 'recordingButton' : 'exampleButton';
        recordButton.id = 'recordingButton';
        document.getElementById('examples').appendChild(recordButton);

        recordButton.addEventListener('click', () => {
            this.recording = true;
            this.removeFromLocalStorage('recordedNotes');
            recordButton.className = this.recording ? 'recordingButton' : 'exampleButton';
        })

    }

    stopRecording() {
        const stopRecordButton = document.createElement('button');
        stopRecordButton.innerHTML = 'Aturar';
        stopRecordButton.className = 'exampleButton';
        document.getElementById('examples').appendChild(stopRecordButton);
        const recordButton = document.getElementById('recordingButton');

        stopRecordButton.addEventListener('click', () => {
            this.recording = false;
            recordButton.className = this.recording ? 'recordingButton' : 'exampleButton';

            if(this.recordedNotes && this.recordedNotes !== null && this.recordedNotes !== []) {
                this.saveToLocalStorage('recordedNotes', this.recordedNotes);
            }
        })
        
        

    }

    playNotes() {
        const playButton = document.createElement('button');
        playButton.innerHTML = 'Reproduir';
        playButton.className = 'exampleButton';
        document.getElementById('examples').appendChild(playButton);

        const primaryGainControl = this.primaryGainControl;

        playButton.addEventListener('click', () => {

            const recNotes = localStorage.getItem('recordedNotes');
            const parsedNotes = JSON.parse(recNotes);
            console.log(parsedNotes);

            const pNotes = () => {
                parsedNotes.forEach(({name, frequency}) => {
                    const noteOscillator = this.audioContext.createOscillator();
                    noteOscillator.type = 'square';
                    noteOscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
                    noteOscillator.connect(primaryGainControl);
                    noteOscillator.start();
                    noteOscillator.stop(this.audioContext.currentTime + 0.5);
    
                    function sleep(milliseconds) {
                        const date = Date.now();
                        let currentDate = null;
                        do {
                          currentDate = Date.now();
                        } while (currentDate - date < milliseconds);
                    }

                    sleep(600)
                })
            }

            pNotes();
              

        })
    }

    createNotesScale() {
        const primaryGainControl = this.primaryGainControl;
        this.notes.forEach(({name, frequency}) => {

            const noteButton = document.createElement('button');
            noteButton.innerHTML = name;
            noteButton.className = 'noteButton';
    
            noteButton.addEventListener('click', () => {
                const noteOscillator = this.audioContext.createOscillator();
                noteOscillator.type = 'square';
                noteOscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
                noteOscillator.connect(primaryGainControl);
                noteOscillator.start();
                noteOscillator.stop(this.audioContext.currentTime + 0.5);

                if(this.recording === true) {
                    this.recordedNotes.push({name: name, frequency: frequency});
                    console.log(this.recordedNotes);
                }

            })
    
            document.getElementById('notes').appendChild(noteButton);
    
        })
    }

    async saveToLocalStorage(itemName, item) {
        await localStorage.setItem(itemName, JSON.stringify(item));
    }

    async removeFromLocalStorage(itemName) {
        await localStorage.removeItem(itemName);
    }

    async getFromLocalStorage(itemName) {
        const recNotes = await localStorage.getItem(itemName);
        const parsedNotes = JSON.parse(recNotes); 
        return parsedNotes;
    }
}