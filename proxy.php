<?php
$sUrl = (isset($_GET['url']) && $_GET['url'] != '') ? $_GET['url'] : '';
header( 'Content-Type: text/xml' );
readfile($sUrl);
?>