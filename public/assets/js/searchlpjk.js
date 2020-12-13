"use strict"; // Reactive UI

function submitCariPenyedia() {
    var e = document.getElementById("searchby");
    var f = document.getElementById("isactive");
    var racord = document.getElementById("searchlpjk");;

    console.log(JSON.stringify({ "racord": racord.value, "option": e.value, "isactive": f.value }));

    ajax().post('@{CONF.baseUrl}/search/viewdata', {
        "headers": {
            "Content-Type": "application/json"
        },
        "data": { "racord": racord.value, "option": e.value, "isactive": f.value },
    }).then(function (response) {
        if (response.status) {
            var data = response.data;
            data.forEach(element => {
                var pre = document.createElement("pre");
                var judul = document.createElement("h2");
                judul.textContent = "Data di temukan : ";
                pre.appendChild(judul);
                var node = document.createElement("a");
                node.href = element.link;
                node.target = "_blank";
                node.innerText = element.nama;
                pre.appendChild(node);
                document.getElementById("sbu").appendChild(pre);
            });


        }
    });
}