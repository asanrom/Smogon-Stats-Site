/**
 * Control panel events and GUI control.
 */

window.actionToConfirm = {
    action: "",
    arg: "",
    title: ""
};

$(document).ready(function () {
    $(document).on('click', 'button', function (event) {
        var target = $(event.currentTarget);
        console.log(target.prop("name"));
        console.log(event.target);
        window.GHY = event;
        switch (target.prop("name")) {
            case "logout":
                actionLogout();
                break;
            case "add-pending":
            case "delete-month":
            case "interrupt":
                actionToConfirm.action = target.prop("name");
                actionToConfirm.arg = target.prop("value");
                actionToConfirm.title = target.prop("title");
                showConfirmationDialog();
                break;
            case "clear-cache":
            case "reload-res":
            case "stop-app":
                actionToConfirm.action = target.prop("name");
                actionToConfirm.arg = "";
                actionToConfirm.title = target.prop("title");
                showConfirmationDialog();
                break;
            case "confirm-action":
                hideConfirmationDialog();
                confirmAction();
                break;
            case "cancel-action":
                hideConfirmationDialog();
                break;
        }

    });

    $("#crawler-status-check").on('change', function (event) {
        changeCrawlerStatus();
    });

    window.appUptime = parseInt(document.getElementById("uptime-span").innerHTML);
    window.statTime = Date.now();

    setInterval(updateUptimeSpan, 1000);
    updateUptimeSpan();
});

function updateUptimeSpan() {
    var uptimeTxt = "";
    var times = [];
    var aux = appUptime + (Date.now() - statTime);

    var unitMs = 7 * 24 * 60 * 60 * 1000;
    times.push({ unit: "week", val: Math.floor(aux / unitMs) });
    aux = aux % unitMs;

    unitMs = 24 * 60 * 60 * 1000;
    times.push({ unit: "day", val: Math.floor(aux / unitMs) });
    aux = aux % unitMs;

    unitMs = 60 * 60 * 1000;
    times.push({ unit: "hour", val: Math.floor(aux / unitMs) });
    aux = aux % unitMs;

    unitMs = 60 * 1000;
    times.push({ unit: "minute", val: Math.floor(aux / unitMs) });
    aux = aux % unitMs;

    unitMs = 1000;
    times.push({ unit: "second", val: Math.floor(aux / unitMs) });

    for (let i = 0; i < times.length; i++) {
        if (!times[i].val) {
            continue;
        }
        if (uptimeTxt) {
            uptimeTxt += ", ";
        }
        uptimeTxt += times[i].val + " " + (times[i].val === 1 ? times[i].unit : (times[i].unit + "s"));
    }

    document.getElementById("uptime-span").innerHTML = uptimeTxt;
}

function showConfirmationDialog() {
    $("#confirmation-dialog-action").text(actionToConfirm.title);
    $("#confirmation-dialog").css({ visibility: "visible" });
}

function hideConfirmationDialog() {
    $("#confirmation-dialog").css({ visibility: "collapse" });
}

function confirmAction() {
    jQuery.post("/admin/action", { action: actionToConfirm.action, arg: actionToConfirm.arg }, function (data) {
        if (typeof data === "string") data = JSON.parse(data);
        if (data.done) {
            document.getElementById("action-snackbar").MaterialSnackbar.showSnackbar({ message: data.done });
        }
    }).fail(function () {
        document.getElementById("action-snackbar").MaterialSnackbar
            .showSnackbar({ message: "Connection error. Cound not perform the action" });
    });
}

function actionLogout() {
    jQuery.post("/admin/action", { action: "logout" }, function (data) {
        document.cookie = "token=; path=/;";
        location.replace(location.href);
    }).fail(function () {
        document.getElementById("action-snackbar").MaterialSnackbar
            .showSnackbar({ message: "Connection error. Cound not perform the action" });
    });
}

function changeCrawlerStatus() {
    jQuery.post("/admin/action", {
        action: "crawler-status",
        arg: $("#crawler-status-check").prop("checked")
    }, function (data) {
        if (typeof data === "string") data = JSON.parse(data);
        if (data.done) {
            document.getElementById("action-snackbar").MaterialSnackbar.showSnackbar({ message: data.done });
        }
    }).fail(function () {
        document.getElementById("action-snackbar").MaterialSnackbar
            .showSnackbar({ message: "Connection error. Cound not perform the action" });
    });
}
