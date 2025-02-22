cp ../../lightning.js .
python -c "import webbrowser; webbrowser.open('http://localhost:4000')" &
python -m http.server 4000
