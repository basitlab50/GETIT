# Automatic Git Push Rule

After completing any code modifications, design updates, or feature additions requested by the user, ALWAYS automatically stage, commit, and push the changes to GitHub:

```powershell
$env:Path = "C:\Program Files\Git\cmd;" + $env:Path;
git add .
git commit -m "<concise descriptive commit message>"
git push
```
