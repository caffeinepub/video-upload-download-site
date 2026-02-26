import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Int "mo:core/Int";

actor {
  include MixinStorage();

  type VideoMetadata = {
    title : Text;
    description : Text;
    uploader : Text;
    uploadTime : Time.Time;
    fileSize : Nat;
    videoId : Text;
    blob : Storage.ExternalBlob;
  };

  module VideoMetadata {
    public func compareByUploadTime(a : VideoMetadata, b : VideoMetadata) : Order.Order {
      Int.compare(a.uploadTime, b.uploadTime);
    };
  };

  let videoStore = Map.empty<Text, VideoMetadata>();

  public shared ({ caller }) func addVideo(title : Text, description : Text, uploader : Text, fileSize : Nat, videoId : Text, blob : Storage.ExternalBlob) : async () {
    let video : VideoMetadata = {
      title;
      description;
      uploader;
      uploadTime = Time.now();
      fileSize;
      videoId;
      blob;
    };
    videoStore.add(videoId, video);
  };

  public query ({ caller }) func getAllVideos() : async [VideoMetadata] {
    videoStore.values().toArray().sort(VideoMetadata.compareByUploadTime);
  };

  public shared ({ caller }) func deleteVideo(videoId : Text) : async () {
    if (not videoStore.containsKey(videoId)) { Runtime.trap("Video not found") };
    videoStore.remove(videoId);
  };

  public query ({ caller }) func getVideo(videoId : Text) : async VideoMetadata {
    switch (videoStore.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) { video };
    };
  };

  public query ({ caller }) func searchByUploader(uploader : Text) : async [VideoMetadata] {
    videoStore.values().filter(func(video) { Text.equal(video.uploader, uploader) }).toArray();
  };
};
