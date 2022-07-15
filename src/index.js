import './css/style.css'
console.log("hello!")

// Needed for Hot Module Replacement
if(typeof(module.hot) !== 'undefined') {
    module.hot.accept() // eslint-disable-line no-undef
}