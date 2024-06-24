document.addEventListener("DOMContentLoaded",function(){
    var origTitle, splitTitle, timer;
    origTitle = document.title;

    function animateTitle(newTitle) {
        let currentState = false;
        splitTitle = origTitle.split('~');
        timer = setInterval(startAnimation, 2000);

        function startAnimation() {
            document.title = currentState ? splitTitle[0] : splitTitle[1];
            currentState = !currentState;
        }
    }

    function restoreTitle() {
        clearInterval(timer);
        document.title = origTitle;
    }

    window.addEventListener("blur", (event) => { animateTitle(); });
    window.addEventListener("focus", (event) => { restoreTitle(); });
});