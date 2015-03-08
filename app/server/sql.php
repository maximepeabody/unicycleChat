<?php
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "maxime", "Peabz.123","unicycleChat");
 mysql_select_db("feed", $con);

$jsondata = file_get_contents('empdetails.json');

$data = json_decode($jsondata, true);

$id = $data['id'];
$from_id = $data['from']['id'];
$from_name = $data['from']['name'];
$message = $data['message'];
$picture = $data['picture'];
$link = $data['link'];
$icon = $data['icon'];
$action_name = $data['action']['name'];
$action_link = $data['action']['link'];
$type= $data['type'];
$status_type = $data['status_type'];
$object_id = $data['object_id'];
$created_time = $data['created_time'];
$updated_time = $data['updated_time'];
$likes_id = $data['likes']['id'];
$likes_name = $data['likes']['name'];
$comments_id = $data['comments']['id'];
$comments_from_id = $data['comments']['from']['id'];
$comments_from_name = $data['comments']['from']['name'];
$comments_message = $data['comments']['message'];
$comments_created_time = $data['comments']['created_time'];
$comments_like_count = $data['comments']['like_count'];
$comments_user_likes = $data['comments']['user_likes'];

//insert into mysql table
    $sql = "INSERT INTO feed(id, from_id, from_name, message, picture, link, icon, action_name, action_link, type, status_type, object_id, created_time, updated_time, likes_id, likes_name, comments_id, comments_from_id, comments_from_name, comments_message, comments_created_time, comments_like_count, comments_user_likes)
    VALUES('$id', '$from_id', '$from_name', '$message', '$picture', '$link', '$icon', '$action_name', '$action_link', '$type','$status_type', '$object_id', '$created_time', '$updated_time', '$likes_id', '$likes_name', '$comments_id', '$comments_from_id', '$comments_from_name', '$comments_message', '$comments_created_time', '$comments_like_count', '$comments_user_likes')";
    if(!mysql_query($sql,$con))
    {
        die('Error : ' . mysql_error());
    }




$result = $conn->query("SELECT CompanyName, City, Country FROM Customers");

$outp = "[";
while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
    if ($outp != "[") {$outp .= ",";}
    $outp .= '{"Name":"'  . $rs["CompanyName"] . '",';
    $outp .= '"City":"'   . $rs["City"]        . '",';
    $outp .= '"Country":"'. $rs["Country"]     . '"}'; 
}
$outp .="]";

$conn->close();

echo($outp);
?>