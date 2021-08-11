export interface License {
    name: string;
    url: string;
}

class _LicenseMap {
    public readonly LICENSE_IMPORTED = "Imported";

    private map: { [shortcode: string]: string } = {
        "Imported": "/assets/licenses/general-imported.txt",
        "telegram": "/assets/licenses/telegram-imported.txt",
        "GPL v3.0": "/assets/licenses/gpl-v3.0.txt",
        "CC BY-NC-SA 4.0": "/assets/licenses/cc_by-nc-sa_4.0.txt",
        "CC BY-NC 4.0": "/assets/licenses/cc_by-nc_4.0.txt",
        "CC BY-SA 4.0": "/assets/licenses/cc_by-sa_4.0.txt",
        "CC BY 4.0": "/assets/licenses/cc_by_4.0.txt",
    };

    public find(name: string): License {
        for (const licenseName of Object.keys(this.map)) {
            if (licenseName.toLowerCase() === name.toLowerCase()) {
                return {name: licenseName, url: this.map[licenseName]};
            }
        }

        return null;
    }
}

export const LicenseMap = new _LicenseMap();