module.exports.getLoginCookie = (req) => {
    const cookies = req.get('Cookie').split(';');
    console.log(cookies);
    let returnValue = null;
    cookies.forEach(cookie => {
        const item = cookie.trim().split('=');
        const key = item[0].trim();
        const value = item[1].trim();
        console.log(key, value);
        if(key === 'loggedIn') {
            returnValue = value;
            return;
        }
    });
    return returnValue;
}