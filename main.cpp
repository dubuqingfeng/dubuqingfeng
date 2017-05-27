#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <qtranslator.h>
#include <QDebug>

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);

    QQmlApplicationEngine engine;
    engine.load(QUrl(QStringLiteral("qrc:/main.qml")));
    QTranslator qtranslator;
    bool success = qtranslator.load("dubuqingfeng_ch.qm", app.applicationDirPath());
    qDebug(success?"success":"false");
    app.installTranslator(&qtranslator);

    return app.exec();
}
