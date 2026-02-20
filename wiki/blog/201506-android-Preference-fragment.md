---
title: 如何使用 PreferenceFragment 方便地完成设置界面
description: "0x01 前言 在设置界面的开发时，以前往往通过自己写界面，在没有合适美工时，比较费时费力，尤其是以前需要兼容Android2.3的时候。当3.0以后出现了PreferenceFragment，可以快速地完成一个类似于系统设置的偏好设定界面。"
date: 2015-06-06 12:13
updated: 2015-06-06 12:13
tags: 
  - Android
  - PreferenceFragment
  - 技术
excerpt: 在android中，利用 PreferenceFragment 快速完成设置界面以及一些思考。
categories: Android
permalink: 201506-android-Preference-fragment.html
author: admin
toc: true
---

# 0x01 前言

在设置界面的开发时，以前往往通过自己写界面，在没有合适美工时，比较费时费力，尤其是以前需要兼容Android2.3的时候。当3.0以后出现了PreferenceFragment，可以快速地完成一个类似于系统设置的偏好设定界面。

在android3.0以后，官方推荐使用PreferenceFragment去替代PreferenceActivity。
以及一些配置。

# 0x02 浅析

PreferenceFragment是继承于Fragment，实现了PreferenceManager.OnPreferenceTreeClickListener这些接口。

```java
/**
 * Interface definition for a callback to be invoked when a
 * {@link Preference} in the hierarchy rooted at this 
 * {@link PreferenceScreen} is
 * clicked.
 *
 * @hide
 */
public interface OnPreferenceTreeClickListener {
    /**
     * Called when a preference in the tree rooted at this
     * {@link PreferenceScreen} has been clicked.
     * 
     * @param preferenceScreen The {@link PreferenceScreen} that the
     *        preference is located in.
     * @param preference The preference that was clicked.
     * @return Whether the click was handled.
     */
    boolean onPreferenceTreeClick(PreferenceScreen 
    preferenceScreen, Preference preference);
}
```

# 0x03 完成步骤

通过新建项目的方式：

在android-studio里，新建一个项目：PreferenceFragmentDemo

选择Blank Activity With Fragment，填写activity为SettingActivity。

**修改fragment继承PreferenceFragment。**

新建一个xml文件，建立/res/xml/preferences.xml

```xml
<PreferenceScreen
    xmlns:android="http://schemas.android.com/apk/res/android">

    <PreferenceCategory
        android:title="设置A">

    <CheckBoxPreference
            android:key="checkbox_preference"
            android:title="标题"
            android:summary="详细" />

    </PreferenceCategory>

    <PreferenceCategory
        android:title="设置B">

    <EditTextPreference
            android:key="edittext_preference"
            android:title="标题"
            android:summary="详细"
            android:dialogTitle="对话框标题" />

    </PreferenceCategory>

</PreferenceScreen>
```

在SettingFragment中，通过addPreferencesFromResource(R.xml.preferences);加载上述的xml文件。

```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    addPreferencesFromResource(R.xml.preferences);
}
```

设置项保存到哪了？SharedPreferences。在/data/data/应用包名/shared_prefs/应用包名_preferences.xml文件中，android:key即为键值名。

如何读取设置？通过SharedPreferences

```java
SharedPreferences mySharedPreferences = PreferenceManager
        .getDefaultSharedPreferences(this);

boolean my_checkbox_preference = mySharedPreferences.getBoolean(
        "checkbox_preference", false);
prefCheckBox.setChecked(my_checkbox_preference);

String my_edittext_preference = mySharedPreferences.getString(
        "edittext_preference", "");
prefEditText.setText(my_edittext_preference);
```
列表设置项的ListPreferences类：

```xml
<ListPreference
      android:key="list_preference"
      android:title="@string/标题"
      android:dialogTitle="@string/对话框标题"
      android:entries="@array/listArray"
      android:entryValues="@array/listValues" />
```

entries和entryValues从哪来？/res/values/array.xml或者/res/values/strings.xml

```xml
<resources>
<string-array name="listArray">
    <item>Headings</item>
    <item>Headings and Details</item>
    <item>All Data</item>
</string-array>

<string-array name="listValues">
    <item>1</item>
    <item>2</item>
    <item>3</item>
</string-array>
</resources>
```
preference-headers类

# 0x04 Preference类
前几天在SIMS(学生信息管理系统)项目中，涉及到了Preference这个类，当时可以通过输入输出流进行与文件的交互。

在Java里可以利用这个类进行一些配置信息的保存等。

详情可参考[PropertiesUtils](https://github.com/DigDream/SIMS/blob/master/src/com/student/sb/utils/PropertiesUtils.java)的实现。

# 0x05 思考

其PreferenceFragment文件源码地址在：[GoogleSource](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/preference/PreferenceFragment.java)，其中利用了ListView进行界面绘制。另外grepcode.com这个网站是个不错的查看android源代码(AOSP)的网站。以及还有一些[示例代码](http://www.programcreek.com/java-api-examples/index.php?api=android.preference.PreferenceFragment)。

并且文档里还介绍了android3.0以前如果想用PreferenceFragment怎么办，详细参考[这个链接](http://developer.android.com/guide/topics/ui/settings.html#BackCompatHeaders)。

[](源码分析)

# 0x06 参考链接

[settings](http://developer.android.com/guide/topics/ui/settings.html)

[官方文档](http://developer.android.com/reference/android/preference/PreferenceFragment.html)

[Using PreferenceFragment to store user preferences](http://www.cs.dartmouth.edu/~campbell/cs65/lecture12/lecture12.html)

[Settings-with-PreferenceFragment](https://github.com/codepath/android_guides/wiki/Settings-with-PreferenceFragment)