const API_URL = 'http://lumenapi.net';


function isAuthenticated(){
    var access = getCookie('access_token');
    var expire = getCookie('expire_at');
    if(access=='' || expire == ''){
        document.cookie = "access_token=;expire_at=" + new Date(0).toUTCString();
        window.location.href = "login.html";
    }
    const now = Date.now().valueOf() / 1000;
    if (typeof expire !== 'undefined' && expire < now) {
        document.cookie = "access_token=" + new Date(0).toUTCString();
        document.cookie = "expire_at=" + new Date(0).toUTCString();
        window.location.href = "login.html";
    }
    
    //check if token valid
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function logOut(){
    document.cookie = "access_token=;expire_at=" + new Date(0).toUTCString();
    window.location.href = "login.html";
}



function getAllCountries() {
    axios({
        method: 'get',
        url: API_URL + '/user/countries',
        params: {},
        headers: {
            "Authorization": `Bearer ${getCookie('access_token')}`,
            "Content-Type": 'application/json'
        }
    })
    .then(res => showOutput(res))
    .catch(err => console.error(err));
}

function searchCountryByName() {
    var search = document.getElementById("searchTerm").value;
    if(search == ''){
        return getAllCountries();
    }
    axios({
        method: 'get',
        url: API_URL + '/user/countries/'+search,
        params: {},
        headers: {
            "Authorization": `Bearer ${getCookie('access_token')}`,
            "Content-Type": 'application/json'
        }
    })
    .then(res => showOutput(res))
    .catch(err => console.error(err));
}

function getUserFavourite() {
    axios({
        method: 'get',
        url: API_URL + '/user/favourites',
        params: {},
        headers: {
            "Authorization": `Bearer ${getCookie('access_token')}`,
            "Content-Type": 'application/json'
        }
    })
    .then(result => showOutputFavourites(result))
    .catch(err => console.error(err));
}

function getCountryDetails(alpha2Code) {
    axios({
        method: 'get',
        url: API_URL + '/user/countries/details/'+alpha2Code,
        params: {},
        headers: {
            "Authorization": `Bearer ${getCookie('access_token')}`,
            "Content-Type": 'application/json'
        }
    })
    .then(res => showCountryDetails(res))
    .catch(err => console.error(err));
}

function addToFavorites(alpha2Code){
    axios({
        method: 'post',
        url: API_URL + '/user/favourites',
        params: {
            alpha2Code: alpha2Code,
        },
        headers: {
            "Authorization": `Bearer ${getCookie('access_token')}`,
            "Content-Type": 'application/json'
        }
    })
    .then(changeIcon(alpha2Code))
    .catch(err => console.error(err));
}

function addComment(alpha2Code){
    html = '';
    var comment = document.getElementById("text_area_"+alpha2Code).value;
    if(comment != ''){
        axios({
            method: 'post',
            url: API_URL + '/user/countries/comments',
            params: {
                alpha2Code: alpha2Code,
                comment: comment
            },
            headers: {
                "Authorization": `Bearer ${getCookie('access_token')}`,
                "Content-Type": 'application/json'
            }
        })
        .then( ( res ) => getUserFavourite(res))
        .catch(err => console.error(err));
    }else{
        html += `
            <div class="mt-3">
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Please enter comment !</strong>
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    document.getElementById('addCommentMessage_'+alpha2Code).innerHTML = html;
}

function removeFromFavourites(alpha2Code){
    axios({
        method: 'delete',
        url: API_URL + '/user/favourites/'+alpha2Code,
        params: {},
        headers: {
            "Authorization": `Bearer ${getCookie('access_token')}`,
            "Content-Type": 'application/json'
        }
    })
    .then(( res ) => getUserFavourite(res))
    .catch(err => console.error(err));
}




// Show output in browser
function showOutput(res) {
    html = '';
    for (let i = 0; i < res.data.data.length; i++) {
        html += `
        <div class="col-sm-3 mt-3 mb-3">
            <div class="card mt-3">
                <div class="card-header">
                    <h5>${res.data.data[i].name}</h5>
                    <span>
                        <img style="width:150px;height: 100px;" src="${res.data.data[i].flag}" alt="Flag of ${res.data.data[i].name}" class="img-thumbnail">
                    </span>
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Region : ${res.data.data[i].region}</li>
                        <li class="list-group-item">Population: ${number_format(res.data.data[i].population, 0, '', ',')} </li>
                        <li class="list-group-item">Add to favorite: 
                            <span id="div_${res.data.data[i].alpha2Code}">
                        `;
                        if(res.data.data[i].favourite){
                            html += `
                                <i class="fa fa-heart fa-lg" style="color:grey;margin-left:10px;" id="heart_${res.data.data[i].alpha2Code}"></i>
                            `;
                        }else{
                            html += `
                                <button type="button" class="btn btn-sm btn-primary" style="margin-left:10px;" id="button_${res.data.data[i].alpha2Code}" onclick="javascript:addToFavorites('${res.data.data[i].alpha2Code}');">
                                    <i class="fa fa-plus" ></i>
                                </button>
                            `;
                        }
                    html +=
                        `  
                            </span>
                        </li>
                        <li class="list-group-item">See more details : 
                            <a href="details.html?alfa2code=${res.data.data[i].alpha2Code}" class="btn btn-sm btn-primary btn-lg active" role="button" aria-pressed="true">
                                <i class="fa fa-search-plus" aria-hidden="true"></i>
                            </a>
                        </li>
                    </ul>
                  <pre></pre>
                </div>
            </div>
        </div>
        `;
    }
    document.getElementById('res').innerHTML = html;
}

function showOutputFavourites(res) {
    console.log(res.data.data);
    html = '';
    for (let i = 0; i < res.data.data.length; i++) {
        html += `
        <div class="col-sm-12 mt-5 mb-5">
            <div class="card mt-3">
                <div class="card-header">
                <h5>${res.data.data[i].name}</h5>
                <span>
                    <img style="width:200px;" src="${res.data.data[i].flag}" alt="Flag of ${res.data.data[i].name}" class="img-thumbnail">
                </span>
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Region : ${res.data.data[i].region}</li>
                        <li class="list-group-item">Population: ${number_format(res.data.data[i].population, 0, '', ',')} </li>
                        <li class="list-group-item">Remove from favorite: 
                            <span id="div_${res.data.data[i].alpha2Code}">
                                <button type="button" class="btn btn-sm btn-primary" style="margin-left:10px;" id="button_${res.data.data[i].alpha2Code}" onclick="javascript:removeFromFavourites('${res.data.data[i].alpha2Code}');">
                                    <i class="fa fa-minus"  ></i>
                                </button>
                            </span>
                        </li>
                        <li class="list-group-item">Add Comment: 
                            <span >
                                <button type="button" class="btn btn-sm btn-primary" style="margin-left:10px;" id="buttonAddComment_${res.data.data[i].alpha2Code}" onclick="javascript:addComment('${res.data.data[i].alpha2Code}');">
                                    <i class="fa fa-floppy-o" ></i>
                                </button>
                            </span>
                            <span>
                                <div class="mt-2">
                                    <textarea class="form-control" id="text_area_${res.data.data[i].alpha2Code}" rows="2"></textarea>
                                </div>
                            </span>
                            <span id="addCommentMessage_${res.data.data[i].alpha2Code}">
                                
                            </span>
                        </li>
        
                        <ul class="list-group list-group-flush">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th scope="col" style="width: 80%">Comment</th>
                                        <th scope="col" style="width: 20%">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                `;
                                   for (let x = 0; x < res.data.data[i].comments.length; x++){
                                        html += `
                                            <tr>
                                                <td>${res.data.data[i].comments[x].comment}</td>
                                                <td>${res.data.data[i].comments[x].created_at}</td>
                                            </tr>
                                        `;
                                   } 
                                html +=  `
                                </tbody>
                            </table>
                        </ul>
                    </ul>
                  <pre></pre>
                </div>
            </div>
        </div>
        `;
    }
    document.getElementById('res_favourites').innerHTML = html;
}

function showCountryDetails(res) {
    //console.log(res);
    var languages = '';
    for (let l = 0; l < res.data.data.languages.length; l++) {
        languages += res.data.data.languages[l]['name'] + ' ,';
    }
    
    console.log(languages);
    
    var regionalBlocs = '';
    for (let b = 0; b < res.data.data.regionalBlocs.length; b++) {
        regionalBlocs += res.data.data.regionalBlocs[b]['acronym'] + ' ,';
    }
    
    var callingCodes = '';
    for (let c = 0; c < res.data.data.callingCodes.length; c++) {
        callingCodes += res.data.data.callingCodes[c] + ' ,';
    }
    
    var timezones = '';
    for (let t = 0; t < res.data.data.timezones.length; t++) {
        timezones += res.data.data.timezones[t] + ' ,';
    }
        
    html = '';
    html += `
        <div class="col-sm-12 mt-5 mb-5">
            <div class="card mt-3">
                <div class="card-header">
                    <h5>${res.data.data.name}</h5>
                    <span>
                        <img style="width:200px;" src="${res.data.data.flag}" alt="Flag of ${res.data.data.name}" class="img-thumbnail">
                    </span>
                </div>
                <div class="card-body">
                    <div class="row">
                            <div class="col-sm-6">
                                <p>General Information</p>
                                <table class="table table-striped">
                                    <tbody>
                                        <tr>
                                            <td style="width: 40%;">Native Name</td>
                                            <td>${res.data.data.nativeName}</td>
                                        </tr>
                                        <tr>
                                            <td>Languages</td>
                                            <td>${languages.slice(0,-1)}</td>
                                        </tr>

                                        <tr>
                                            <td>Alpha2Code</td>
                                            <td>${res.data.data.alpha2Code}</td>
                                        </tr>
                                        <tr>
                                            <td>Alpha3Code</td>
                                            <td>${res.data.data.alpha3Code}</td>
                                        </tr>
                                        <tr>
                                            <td>Alpha3Code</td>
                                            <td>${callingCodes.slice(0,-1)}</td>
                                        </tr>
                                        <tr>
                                            <td>Timezones</td>
                                            <td>${timezones.slice(0,-1)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="col-sm-6">
                                <p>Geography</p>
                                <table class="table table-striped">
                                    <tbody>
                                        <tr>
                                            <td style="width: 40%;">Capital</td>
                                            <td>${res.data.data.capital}</td>
                                        </tr>
                                        <tr>
                                            <td>Population</td>
                                            <td>${number_format(res.data.data.population, 0, '', ',')}</td>
                                        </tr>
                                        <tr>
                                            <td>Area</td>
                                            <td>${res.data.data.area}</td>
                                        </tr>
                                        <tr>
                                            <td>Region</td>
                                            <td>${res.data.data.region}</td>
                                        </tr>
                                        <tr>
                                            <td>Subregion</td>
                                            <td>${res.data.data.subregion}</td>
                                        </tr>
                                        <tr>
                                            <td>Subregion</td>
                                            <td>${regionalBlocs.slice(0,-1)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    document.getElementById('res_details').innerHTML = html;
}



function changeIcon(alpha2Code){
    var button = document.getElementById("button_"+alpha2Code);
    button.remove();
    document.getElementById('div_'+alpha2Code).innerHTML = '<i class="fa fa-heart fa-lg" style="color:grey;margin-left:10px;" id="heart_'+alpha2Code+'"></i>';
}

function number_format (number, decimals, dec_point, thousands_sep) {
    // Strip all characters but numerical ones.
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

// Event listeners
//document.getElementById('getAllCountries').addEventListener('click', getAllCountries);
//document.getElementById('getFavouritesPerUser').addEventListener('click', getFavouritesPerUser);

