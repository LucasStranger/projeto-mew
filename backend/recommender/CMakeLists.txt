cmake_minimum_required(VERSION 3.16)
project(mew_recommender LANGUAGES CXX)
add_executable(recommender main.cpp)
target_compile_features(recommender PRIVATE cxx_std_17)
