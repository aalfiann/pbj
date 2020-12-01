"use strict";

function parseJWT (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};

function logout(baseUrl, _cb) {
    localStorage.removeItem(baseUrl+'_tokenize');
    if(_cb && typeof _cb === "function") {
        _cb();
    } else {
        return location = baseUrl + '/login';
    }
}

function getToken(baseUrl, _cb) {
    if(getWithExpiry(baseUrl+'_tokenize') === null) {
        profile_nav.data.token = null;
        profile_nav.data.baseUrl = '';
        if(_cb && typeof _cb === "function") {
            _cb(null);
        } else {
            return null;
        }
    } else {
        var token = getWithExpiry(baseUrl+'_tokenize');
        if(token) {
            profile_nav.data.token = token;
            profile_nav.data.baseUrl = baseUrl;
        }
        if(_cb && typeof _cb === "function") {
            _cb(token);
        } else {
            return token;
        }
    }
}

var profile_nav = new Reef('#profile_nav', {
    data: {
        token: null,
        baseUrl: ''
    },
    template: function (props) {
        if(props.token) {
            var profile = parseJWT(props.token);
            return `<div class="navbar-end">
            <div class="navbar-item has-dropdown has-dropdown-with-icons has-divider has-user-avatar is-hoverable">
            <a class="navbar-link is-arrowless">
              <div class="is-user-avatar">
                <img src="https://gravatar.com/avatar/${MD5(profile.mail)}" alt="${profile.unm}">
              </div>
              <div class="is-user-name"><span>${profile.unm}</span></div>
              <span class="icon"><i class="mdi mdi-chevron-down"></i></span>
            </a>
            <div class="navbar-dropdown">
              <a href="${props.baseUrl+'/user/'+profile.unm}" class="navbar-item">
                <span class="icon"><i class="mdi mdi-account"></i></span>
                <span>My Profile</span>
              </a>
              <a class="navbar-item">
                <span class="icon"><i class="mdi mdi-cog"></i></span>
                <span>Settings</span>
              </a>
              <hr class="navbar-divider">
              <a class="navbar-item" onclick="logout('${props.baseUrl}')">
                <span class="icon"><i class="mdi mdi-logout"></i></span>
                <span>Log Out</span>
              </a>
            </div>
          </div>
            <a href="https://justboil.me/bulma-admin-template/one-html" title="About" class="navbar-item has-divider is-desktop-icon-only">
                <span class="icon"><i class="mdi mdi-help-circle-outline"></i></span>
                <span>About</span>
            </a>
          </div>`;
        } else {
            return `<div class="navbar-end">
            <a href="${props.baseUrl+'/login'}" title="Login" class="navbar-item has-divider is-desktop-icon-only">
                <span class="icon"><i class="mdi mdi-login"></i></span>
                <span>Login</span>
            </a>
            <a href="https://justboil.me/bulma-admin-template/one-html" title="About" class="navbar-item has-divider is-desktop-icon-only">
                <span class="icon"><i class="mdi mdi-help-circle-outline"></i></span>
                <span>About</span>
            </a>
            </div>`;
        }
    }
});
profile_nav.render();

var menu_aside = new Reef('#menu_aside', {
    data: {
        baseUrl: '',
        menu: []
    },
    template: function (props) {
        if(props.menu.length > 0) {
            return `<p class="menu-label">Client Area</p>
            <ul class="menu-list">
                ${props.menu.map(function(menus){
                    if(menus.type === 'link') {
                        return `<li>
                            <a href="${(menus.url.indexOf('://') !== -1 ? menus.url: props.baseUrl + menus.url)}" class="is-active router-link-active has-icon">
                            <span class="icon"><i class="${menus.icon}"></i></span>
                            <span class="menu-item-label">${menus.name}</span>
                            </a>
                        </li>`;
                    } else {
                        return `<li>
                        <a class="has-icon has-dropdown-icon">
                          <span class="icon"><i class="mdi mdi-view-list"></i></span>
                          <span class="menu-item-label">${menus.name}</span>
                          <div class="dropdown-icon">
                            <span class="icon"><i class="mdi mdi-plus"></i></span>
                          </div>
                        </a>
                        <ul>
                          ${menus.child.map(function(child) {
                            return `<li>
                                <a href="${(child.url.indexOf('://') !== -1 ? child.url : props.baseUrl + child.url)}">
                                <span class="ml-4"><i class="mdi mdi-arrow-right mr-2"></i>${child.name}</span>
                                </a>
                            </li>`;
                          }).join('')}
                        </ul>
                      </li>`;
                    }
                    
                }).join('')}
            </ul>`;
        } else {
            return '';
        }
    }
});
menu_aside.render();

document.addEventListener('render', function (event) {
	// Only run for elements with the #menu_aside ID
	if (!event.target.matches('#menu_aside')) return;
	// Log the data at the time of render
	if (event.detail.menu.length > 0); {
        /* Aside: submenus toggle */
        Array.from(document.getElementsByClassName('menu is-menu-main internal')).forEach(function (el) {
            Array.from(el.getElementsByClassName('has-dropdown-icon')).forEach(function (elA) {
                elA.addEventListener('click', function (e) {
                    var dropdownIcon = e.currentTarget.getElementsByClassName('dropdown-icon')[0].getElementsByClassName('mdi')[0];
                    e.currentTarget.parentNode.classList.toggle('is-active');
                    dropdownIcon.classList.toggle('mdi-plus');
                    dropdownIcon.classList.toggle('mdi-minus');
                });
            });
        });
    }
}, false);

function getMenu(baseUrl, token, _cb) {
    if(token) {
        ajax({
            headers: {
              'x-token': token
            }
        })
        .get(baseUrl + '/api/menu/parent/list-by-role')
        .then(function(response, xhr) {
            menu_aside.data.baseUrl = baseUrl;
            menu_aside.data.menu = response.data;
            var validMenu = false;
            for(var i=0; i < response.data.length; i++) {
                if(response.data[i].type === 'link') {
                    if(location.href == baseUrl+response.data[i].url) {
                        validMenu = true;
                        break;
                    }
                } else {
                    for(var x=0; x< response.data[i].child.length; x++) {
                        if(location.href == baseUrl+response.data[i].child[x].url) {
                            validMenu = true;
                            break;
                        }
                    }
                }
            }
            if(_cb && typeof _cb === "function") {
                _cb(null,validMenu);
            }
        })
        .catch(function(response, xhr) {
            if(_cb && typeof _cb === "function") {
                _cb(xhr.responseText,false);
            } else {
                console.log(xhr.responseText);
            }
        })
    }
}