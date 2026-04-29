package com.fleet.driver;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static final String PREF_NAME = "FleetSession";
    private static final String KEY_TOKEN = "token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_USER_NAME = "user_name";
    private static final String KEY_VEHICLE_ID = "vehicle_id";

    private SharedPreferences prefs;

    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public void saveSession(String token, int userId, String userName) {
        prefs.edit()
                .putString(KEY_TOKEN, token)
                .putInt(KEY_USER_ID, userId)
                .putString(KEY_USER_NAME, userName)
                .apply();
    }

    public void saveVehicleId(int vehicleId) {
        prefs.edit().putInt(KEY_VEHICLE_ID, vehicleId).apply();
    }

    public String getToken() { return prefs.getString(KEY_TOKEN, null); }
    public int getUserId() { return prefs.getInt(KEY_USER_ID, -1); }
    public String getUserName() { return prefs.getString(KEY_USER_NAME, ""); }
    public int getVehicleId() { return prefs.getInt(KEY_VEHICLE_ID, -1); }

    public boolean isLoggedIn() { return getToken() != null; }

    public void logout() { prefs.edit().clear().apply(); }
}