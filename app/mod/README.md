# CasaMod Contribution Guide / 贡献指南

Welcome to contribute your creativity and code to CasaMod! To ensure code quality and consistency, please follow these guidelines:

欢迎为 CasaMod 贡献你的创意和代码！为了确保代码质量和一致性，请遵循以下指南：

## Structure / 结构

Each MOD should be placed in a separate folder, and the folder name should follow these rules:

* Lowercase: All letters should be lowercase.
* Replace spaces with -: Spaces in the folder name should be replaced with hyphens `-`.
* Example: `my-awesome-mod`

The MOD folder should be organized with the following structure: #
  * **mod.js** The main JavaScript file of the MOD, containing the logic and functions of the MOD.
  * **/img** Subdirectory to store other resource files, such as images.

每个 MOD 应该放在一个独立的文件夹中，文件夹名称应符合以下规则：

* 小写：所有字母都应小写。
* 空格以 - 代替：文件夹名称中的空格应使用连字符 `-` 代替。
* 示例：`my-awesome-mod`

MOD 文件夹内应按照以下结构组织资源：
* **mod.js** MOD 的主要 JavaScript 文件，包含 MOD 的逻辑和功能。
* **/img** 子目录存放其他资源文件，例如图片

Example / 示例 :

```
my-awesome-mod/
├── mod.js
└── img
    └── image.jpg
```

## mod.js

The `mod.js` file is the entry point of the MOD. Please wait for Vue rendering to complete before performing DOM operations. Example:

`mod.js` 文件是 MOD 的入口点，注意等待 vue 渲染完成再进行 DOM 操作，示例：

```javascript
alert("Hello, World!")
```

Thank you for your contribution to CasaMod!

感谢你为 CasaMod 做出的贡献！
