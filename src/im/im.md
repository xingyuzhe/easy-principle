框架无关性。系统不依赖于框架中的某个函数，框架只是一个工具，系统不能适应于框架。
可被测试。业务逻辑脱离于 UI、数据库等外部元素进行测试。
UI 无关性。不需要修改系统的其它部分，就可以变更 UI，诸如由 Web 界面替换成 CLI。
数据库无关性。业务逻辑与数据库之间需要进行解耦，我们可以随意切换 LocalStroage、IndexedDB、Web SQL。
外部机构（agency）无关性。系统的业务逻辑，不需要知道其它外部接口，诸如安全、调度、代理等。
