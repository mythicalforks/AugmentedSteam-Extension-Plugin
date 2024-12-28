import json
import os
import shutil

import Millennium
import PluginUtils
import requests

logger = PluginUtils.Logger("augmented-steam")

CSS_ID = None
DEBUG = True

def GetPluginDir():
    return os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..'))

def BackendFetch(url: str) -> str:
    response = requests.get(url)

    result = {
        'ok': 200 <= response.status_code < 300,
        'status': response.status_code,
        'url': url,
        'headers': dict(response.headers),
        'body': response.text,
    }

    return json.dumps(result)

STEAM_ID = None

def GetSteamId():
    global STEAM_ID
    if STEAM_ID is None:
        STEAM_ID = Millennium.call_frontend_method('getSteamId')
    return STEAM_ID

class Plugin:
    def copy_frontend_files(self):
        envFolder = 'dev.chrome' if DEBUG else 'prod.chrome'
        augmentedSteamPath = os.path.join(GetPluginDir(), 'AugmentedSteam', 'dist', envFolder)
        steamUIPath = os.path.join(Millennium.steam_path(), 'steamui', 'AugmentedSteam')

        logger.log(f"Copying frontend files from {augmentedSteamPath} to {steamUIPath}")
        try:
            os.makedirs(os.path.dirname(steamUIPath), exist_ok=True)
            # Copy folders html, img and css/options.css and js/options.js
            for folderName in ['html', 'img']:
                folderPath = os.path.join(augmentedSteamPath, folderName)
                if os.path.exists(folderPath):
                    destPath = os.path.join(steamUIPath, folderName)
                    logger.log(f"Copying folder {folderName} from {folderPath} to {destPath}")
                    shutil.copytree(folderPath, destPath, dirs_exist_ok=True)

            for filename in ['css\\options.css', 'js\\options.js']:
                filePath = os.path.join(augmentedSteamPath, filename)
                if os.path.exists(filePath):
                    destPath = os.path.join(steamUIPath, filename)
                    logger.log(f"Copying file {filename} from {filePath} to {destPath}")
                    os.makedirs(os.path.dirname(destPath), exist_ok=True)
                    shutil.copyfile(filePath, destPath)

        except Exception as e:
            logger.error(f"Failed to copy files, {e}")

    def _front_end_loaded(self):
        return

    def _load(self):
        logger.log(f"bootstrapping AugmentedSteam plugin, millennium {Millennium.version()}")
        self.copy_frontend_files()

        Millennium.ready()  # this is required to tell Millennium that the backend is ready.

    def _unload(self):
        logger.log("unloading")
