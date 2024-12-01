document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('playPacman').addEventListener('click', function() {
        // Hide main content
        document.querySelector('h1').style.display = 'none';
        document.querySelector('.flex.items-center').style.display = 'none';
        document.querySelector('.timer-container').style.display = 'none';
        this.style.display = 'none';
        
        // Show and initialize Pac-Man game
        document.getElementById('pacmanGame').style.display = 'block';
    });
});