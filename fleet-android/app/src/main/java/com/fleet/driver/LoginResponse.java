package com.fleet.driver;

public class LoginResponse {
    public String token;
    public User user;

    public static class User {
        public int id;
        public String name;
        public String role;
    }
}