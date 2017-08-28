# Config dialog

* Can enable bot without auth.
* Can set default repo without auth.
* Auth is only required for repository notifications.
* Auth URL generation should use Dimension as the final redirect. Use param to indicate config dialog to open on success
* Use current iframe (if possible) for auth. Avoid popups.


**Note**: In-chat auth links won't work. That's [#2](https://github.com/turt2live/matrix-dimension/issues/2).