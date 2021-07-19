import QtQuick 2.6
import QtQuick.Window 2.2
import QtQuick.Layouts 1.1
import QtQuick.Controls 2.1
import QtGraphicalEffects 1.0

Rectangle{
    id:sport;
    Layout.fillWidth: true;
    Layout.fillHeight: true;
    Layout.row: 0;
    Layout.column: 0;
    property alias text: text.text
    property alias source: image.source

    Image {
        id: image
        width: parent.width
        height: parent.height
        Layout.fillWidth: true;
        Layout.fillHeight: true;
        source: "images/sports.jpeg"
    }

    Rectangle {
        id: rec
        color:Qt.rgba(0.5,0.5,0.5,0.7)
        width: parent.width
        height: parent.height / 3
        anchors.bottom: parent.bottom
        Text{
            id:text;
            text: "运 动";
            font.bold : true
            font.pointSize: 24
            color: "black";
            anchors.right: parent.right;
            anchors.centerIn: parent
            z:3;
        }
    }
}
