import QtQuick 2.6
import QtQuick.Window 2.2
import QtQuick.Layouts 1.1
import QtQuick.Controls 2.1
import QtGraphicalEffects 1.0

Window {
    visible: true
    width: 640
    height: 640
    title: qsTr("Dubuqingfeng's Life")

    GridLayout {
        id: grid
        width: parent.width;
        columns: 3
        rows: 3
        anchors.fill: parent;

        Element {
            source: "images/sports.jpeg"
            text: "运 动"
            Layout.row: 0;
            Layout.column: 0;
        }

        Element {
            source: "images/read.jpeg"
            text: "阅 读"
            Layout.row: 0;
            Layout.column: 1;
        }

        Element {
            source: "images/write.jpeg"
            text: "写 作"
            Layout.row: 0;
            Layout.column: 2;
        }

        Element {
            source: "images/life.jpg"
            text: "日 常"
            Layout.row: 1;
            Layout.column: 0;
        }

        Element {
            source: "images/learn.jpeg"
            text: "学 习"
            Layout.row: 1;
            Layout.column: 1;
        }

        Element {
            source: "images/work.jpeg"
            text: "工 作"
            Layout.row: 1;
            Layout.column: 2;
        }

        Element {
            source: "images/travel.jpeg"
            text: "旅 行"
            Layout.row: 2;
            Layout.column: 0;
        }

        Element {
            source: "images/financing.jpeg"
            text: "理 财"
            Layout.row: 2;
            Layout.column: 1;
        }

        Element {
            source: "images/game.jpeg"
            text: "娱 乐"
            Layout.row: 2;
            Layout.column: 2;
        }


    }
}
