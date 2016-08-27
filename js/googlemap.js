$(function () {

    "use strict";

    /* Setup global variables */
    var $googleMap,
        $markerInfoWrap,
        $showMarkerInfo,
        $showMarkerAddress,
        $headerWrap,
        $toggleHeaderBtn,
        $showStreetViewBtn,
        $closeMarkerInfoBtn,
        $searchInputTxt,
        $searchBtn,
        $ddMeny,
        autocomplete,
        map,
        marker,
        geocoder,
        streetview,
        panorama;

    
    var setObj = function () {
        $googleMap = $("#googleMap");
        $markerInfoWrap = $("#markerInfoWrap");
        $showMarkerInfo = $("#showMarkerInfo");
        $headerWrap = $("#headerWrap");
        $toggleHeaderBtn = $("#toggleHeaderBtn");
        $showMarkerAddress = $("#showMarkerAddress");
        $showStreetViewBtn = $("#showStreetViewBtn");
        $closeMarkerInfoBtn = $("#closeMarkerInfoBtn");
        $searchInputTxt = $("#searchInputTxt");
        $searchBtn = $("#searchBtn");
        $ddMeny = $("#ddMeny");
    };


    /* Google map Initialization */
    var googlemapInit = function () {
        var myLatlng = new google.maps.LatLng(59.8, 10.7);
        var mapOptions = {
            zoom: 5,
            center: myLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map($googleMap.get(0), mapOptions);
        geocoder = new google.maps.Geocoder;
        streetview = new google.maps.StreetViewService();

    };

    
    var setEvents = function () {
        /* Event for placing marker and getting info */
        google.maps.event.addListener(map, "click", function (event) {
            placeMarker(event.latLng, map);
            getMarkerInfo(event.latLng, map);
        });


        /* Search map based on input from input.val */
        $searchBtn.click(function () {
            searchAndGetLocationInfo(map);
        });


        /* Search action with Return-key */
        $searchInputTxt.keypress(function (e) {
            if (e.which == 13) {
                searchAndGetLocationInfo(map);
            }
        });


        /* Change map to streetview. This will only display when streetview is available */
        $showStreetViewBtn.click(function () {
            var currentMarker = {
                lat: marker.getPosition().lat(),
                lng: marker.getPosition().lng()
            }
            toggleStreetView(currentMarker);
        });

        
        /* Close marker info */
        $closeMarkerInfoBtn.click(function () {
            $(this).toggleClass("btn-success");
            $showMarkerInfo.slideToggle(200);
        });

        
        /* Toggle nav */
        $toggleHeaderBtn.click(function () {
            if ($(this).hasClass("toggleHeaderBtn-clicked")) {
                $(this).removeClass("toggleHeaderBtn-clicked");
                $headerWrap.removeClass("headerWrap-open");
                $markerInfoWrap.removeClass("markerInfoWrap-headerOpen");

            } else {
                $(this).addClass("toggleHeaderBtn-clicked");
                $headerWrap.addClass("headerWrap-open");
                $markerInfoWrap.addClass("markerInfoWrap-headerOpen");
            }
        });

    };

    
    /* Converting latlng to address, or reverse */
    function getLocationInfo(geoCodeKey, geoCodeValue, callback) {
        var geoJSON = {};
        geoJSON[geoCodeKey] = geoCodeValue;
        geocoder.geocode(geoJSON, function (data, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                callback(data);
            } else {
                alert("Error: " + status);
            }
        });
    };


    /* Based on lat and lng placemarker, convert and show addres */
    function getMarkerInfo(latLng, map) {
        getLocationInfo("location", latLng, function (data) {
            // if address exists
            if (data[1]) {
                // Set marker info
                var markerInfo = {
                    sted: data[1].formatted_address,
                    gate: data[0].formatted_address
                };
                markerInfo = "<b>Sted:</b> " + markerInfo.sted + ". <b>Adresse:</b> " + markerInfo.gate;
                // Animate marker
                $showMarkerInfo
                    .slideUp(100)
                    .slideDown(300);

                $closeMarkerInfoBtn
                    .slideUp(80)
                    .removeClass("btn-success")
                    .slideDown(300);
                // Display marker info
                $showMarkerAddress.html(markerInfo);
            } else {
                alert("Ingen adresse funnet");
            }
        });
    };


    /* Based on searchinput, convert from address to lng lat and get marker w/info */
    function searchAndGetLocationInfo(map) {
        var address = $searchInputTxt.val();
        getLocationInfo("address", address, function (data) {
            var latLng = data[0].geometry.location;
            placeMarker(latLng, map);
            getMarkerInfo(latLng, map);
        });
    };


    /* Autocomplete searchfield */
    function autoComplete() {
        // Autocomplete requires pure HTML-element. Hence .get(0) with jquery
        var input = $searchInputTxt.get(0);

        autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.addListener('place_changed', function () {
            var latLng = autocomplete.getPlace().geometry.location;
            getMarkerInfo(latLng, map);
            placeMarker(latLng, map);
        });
    };


    /* Placemarker, and run streetview validation function based on location*/
    function placeMarker(latLng, map) {
        if (marker) {
            marker.setMap(null);
        }
        marker = new google.maps.Marker({
            position: latLng,
            map: map
        });
        map.panTo(latLng);

        /* Send markers location for Streetview validation */
        streetview.getPanorama({
            location: latLng,
            radius: 40
        }, validateStreetview);
    };


    /* Check if location from marker can display streetview */
    function validateStreetview(data, status) {
        if (status === google.maps.StreetViewStatus.OK) {
            $showStreetViewBtn.show();
        } else {
            $showStreetViewBtn.hide();
        }
    };


    /* Toggle streetview, if validation OK */
    function toggleStreetView(latLng) {
        panorama = map.getStreetView();
        panorama.setPosition(latLng);
        var toggle = panorama.getVisible();
        console.log(toggle);
        if (toggle === false) {
            panorama.setVisible(true);
            /* On streetview changes, change location info */
            panorama.addListener('pano_changed', function () {
                var latLng = panorama.location.latLng;
                getMarkerInfo(latLng);

            });
            $showStreetViewBtn
                .removeClass("btn-success")
                .addClass("btn-danger");
        } else {
            panorama.setVisible(false);
            $showStreetViewBtn
                .removeClass("btn-danger")
                .addClass("btn-success")
        }
    };

    
    /* Change mapstyle */
    function mapStyle() {
        /* Map styles minified. Beautify will expand json. */
        var mapStyes = {};
        
        /* Black map style */
        mapStyes.black = [
            {"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}
        ];

        /* Blue vater style */
        mapStyes.bluewater = [
            {"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}
        ];
        
        /*Standard map stype */
        mapStyes.standard = [
            {"featureType":"administrative.country","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#00fff2"}]},{"featureType":"poi","elementType":"labels.icon","stylers":[{"visibility":"on"}]}
        ];

        /* Set stylechoices in dropdown and fire mapstylechange on click*/
        $.each(mapStyes, function (i, value) {
            $ddMeny.append(
                $("<li>")
                .html("<a href='#'>" + i + "</a>")
                .click(function () {
                    map.setOptions({
                        styles: value
                    });
                    $(this)
                        .addClass("active")
                        .siblings().removeClass("active")

                })

            ); /* append end*/
        });

    } /* mapstyle function end */

    
    /* Initialize code */
    var init = function () {
        setObj();
        googlemapInit();
        setEvents();
        mapStyle();
        autoComplete();
    }();
});