const form = document.querySelector('form');
const date = document.querySelector('#date');
const PAI = document.querySelector('#value');
const error = document.querySelector('#error');

form.addEventListener('submit', (e) => {

    e.preventDefault();
    const d = new Date(date.value);

    console.log('date, PAI', d.getSeconds(), PAI.value)
        ;
    if (date.value && PAI.value) {

        const item = {
            date: name.value,
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