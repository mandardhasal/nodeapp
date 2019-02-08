#Notebook config
c = get_config()
c.NotebookApp.notebook_dir = '/home/nb-user/work'
c.NotebookApp.ip = '0.0.0.0'
c.NotebookApp.port = 8888
c.NotebookApp.open_browser = False
c.NotebookApp.password_required = False
c.NotebookApp.token = ''
c.NotebookApp.password = ''
#c.NotebookApp.terminals_enabled = False