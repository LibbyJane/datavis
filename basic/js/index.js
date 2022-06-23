docReady(function () {
    // DOM elements
    const fitnessTracker = document.getElementById('fitnessTracker');
    const ftBtns = fitnessTracker.querySelectorAll('button');
    const ftForm = document.getElementById('ftForm');
    const ftFormAct = document.getElementById('js-ft-type');
    const ftInput = document.getElementsByClassName('js-ft-input')[0];
    const ftError = document.getElementById('ftError');

    console.log('btns', ftBtns, typeof ftBtns);
    var activity = 'cycling';

    // for (let [key, value] of Object.entries(ftBtns)) {
    //     console.log(key, value);
    // }

    Object.values(ftBtns).forEach(btn => {

        btn.addEventListener('click', e => {
            activity = e.target.dataset.activity;

            // // remove and add active class
            Object.values(ftBtns).forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // set id of input field
            ftInput.setAttribute('id', activity);
            ftFormAct.setAttribute('data-activity', activity);

            // // set text of form span (the activity)
            ftFormAct.textContent = activity;
        });
    });

    // form submit
    ftForm.addEventListener('submit', e => {
        // prevent default action
        e.preventDefault()

        const distance = parseInt(ftInput.value);

        if (distance) {
            db.collection('fitnessTracker').add({
                distance,
                activity,
                date: new Date().toString()
            }).then(() => {
                ftError.textContent = '';
                ftInput.value = '';
            }).catch(err => console.log(err));
        } else {
            ftError.textContent = 'Please enter a valid distance'
        }

    });

    const PAIform = document.getElementById('PAIform');
    const date = document.getElementById('date');
    const PAI = document.getElementById('value');
    const error = document.getElementById('error');

    PAIform.addEventListener('submit', (e) => {

        e.preventDefault();
        const d = new Date(date.value);

        if (d && PAI.value) {
            const item = {
                date: firebase.firestore.Timestamp.fromDate(d),
                value: parseInt(PAI.value)
            };

            db.collection('PAI').add(item).then(res => {
                console.log('res', res);
                error.textContent = '';
                date.value = '';
                PAI.value = '';
            });

        } else {
            error.textContent = 'Please enter values before submitting';
        }

    });
});


function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}