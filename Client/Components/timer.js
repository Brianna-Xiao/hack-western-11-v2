
export default class Timer {
    constructor(root){
        root.innerHTML = Timer.getHTML();

        this.el = {
            minutes: root.querySelector(".timer__part--minutes"),
            seconds: root.querySelector(".timer__part--seconds"),
            control: root.querySelector(".timer__btn--control"),
            reset: root.querySelector(".timer__btn--reset"),
        };

        this.interval = null;
        this.remainingSeconds = 0;
        this.loadInitialState();

        this.el.control.addEventListener("click", () =>{
            if(this.interval === null){
                this.start();
            }
            else{
                this.stop();
            }
        });

        this.el.reset.addEventListener("click", () => {
            const inputMinutes = prompt("Enter number of minutes: ");
            if(inputMinutes <= 60){
                this.stop();
                this.remainingSeconds = inputMinutes * 60;
                this.updateInterfaceTime();
            }
            else{
                this.stop();
                this.remainingSeconds = 3600;
                this.updateInterfaceTime();
            }

        });
    }

    async loadInitialState(){
        try{
            const response = await fetch("http://localhost:5000/timer");
            const data = await response.json();
            this.remainingSeconds = data.remainingSeconds;
            this.updateInterfaceTime();
        }
        catch(error){
            console.error("Error fetching timer state:", error);
        }
    }

    async updateBackendState(seconds){
        try{
            const response = await fetch("http://localhost:5000/timer", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({seconds}),
            });
        
            const data = await response.json();
            console.log("Backend state updated:", data)
        }
        catch(error){
            console.error("Failed to update timer state:", error);
        }
    }

    updateInterfaceTime(){
        const minutes = Math.floor(this.remainingSeconds / 60)
        const seconds = this.remainingSeconds % 60

        this.el.minutes.textContent = minutes.toString().padStart(2, "0");
        this.el.seconds.textContent = seconds.toString().padStart(2, "0");
    }

    updateInterfaceControls(){
        if(this.interval === null){
            this.el.control.innerHTML = `<span class="material-icons">play_arrow</span>`;
            this.el.control.classList.add("tuner__btn--start");
            this.el.control.classList.remove("timer__btn--stop");
        }
        else{
            this.el.control.innerHTML = `<span class="material-icons">pause</span>`;
            this.el.control.classList.add("timer__btn--stop");
            this.el.control.classList.remove("timer__btn--start");
        }
    }

    async start() {
        if (this.remainingSeconds === 0) return;

        this.interval = setInterval(async () =>{
            this.remainingSeconds--;
            this.updateInterfaceTime();
            
            if (this.remainingSeconds <= 0){
                this.remainingSeconds = 0;
                this.updateInterfaceTime();
                this.stop();
            }
            //problem is that when the timer is set to a knew time, and the extension is closed right away
            //the timer state is not saved since the state is only saved during this "start()" function 
            //and the start function is not called after the timer is set until the play button is pressed
            await this.updateBackendState(this.remainingSeconds);
        }, 1000);

        this.updateInterfaceControls();
    }

    async stop(){
        clearInterval(this.interval);

        this.interval = null;

        this.updateInterfaceControls();

        await this.updateBackendState(this.remainingSeconds);
    }

    static getHTML(){
        return `
            <span class="timer__part timer__part--minutes font-bold">00</span>
            <span class="timer__part">:</span>
            <span class="timer__part timer__part--seconds font-bold">00</span>
            <button type="button" class="timer__btn timer__btn--control timer__btn--start">
                <span class="material-icons">play_arrow</span>
            </button>
            <button type="button" class="timer__btn timer__btn--reset h-2 w-2">
                <span class="material-icons">timer</span>
            </button>
        `;
    }
}