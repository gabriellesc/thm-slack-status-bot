#!/usr/bin/env ruby
require "net/http"
require "json"
require "fortune_gem"

EMOJI_FILE = 'animal_emoji_list'

get_uri = URI('https://slack.com/api/users.profile.get')
res = Net::HTTP.start(get_uri.host,
                      get_uri.port,
                      :use_ssl => get_uri.scheme == 'https') do |http|
  get_req = Net::HTTP::Get.new get_uri
  get_req['X-Slack-User'] = ENV['USER_ID']
  get_req['Authorization'] = "Bearer #{ENV['TOKEN']}"
  http.request get_req
end
prev_status = res.body

begin
  text = FortuneGem.give_fortune({:max_length => 100})
end while text == prev_status['status_text']

emojis = IO.readlines(EMOJI_FILE)
prng = Random.new
begin
  emoji = ":#{emojis[prng.rand(emojis.size)].strip}:"
end while emoji == prev_status['status_emoji']

post_uri = URI('https://slack.com/api/users.profile.set')
Net::HTTP.start(post_uri.host,
                post_uri.port,
                :use_ssl => post_uri.scheme == 'https') do |http|
  post_req = Net::HTTP::Post.new post_uri
  post_req['Content-Type'] = 'application/json; charset=utf-8'
  post_req['X-Slack-User'] = ENV['USER_ID']
  post_req['Authorization'] = "Bearer #{ENV['TOKEN']}"
  post_req.body = {
    profile: {status_text: "#{text}", status_emoji: "#{emoji}", status_expiration: 0}
  }.to_json
  http.request(post_req)
end
