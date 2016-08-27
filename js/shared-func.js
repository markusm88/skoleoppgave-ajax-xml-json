$(function () {
    var $taskNav,
        $toggleTaskBtn;
    
    $taskNav = $(".taskNav");
    $toggleTaskBtn = $(".toggleTaskBtn");
    
    $toggleTaskBtn.click(function () {
        if ($taskNav.hasClass("taskNav-open")) {
            $(this).text("<");
            $($taskNav).removeClass("taskNav-open");
        } else {
            $(this).text(">");
            $($taskNav).addClass("taskNav-open");
        }

    });
});