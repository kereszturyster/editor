import $ from "jquery";
import {ContextRangeContainer} from "./ContextRange/ContextRangeContainer";

$(function(){
  const containers = new ContextRangeContainer(".container");
  containers.onCreateRange(() => {
    console.log("Context", containers.getContext().get());
    console.log("Images", containers.getImages().get());
    console.log("TextElements", containers.getTextElements().get());
    console.log("Containers", containers.getContainers().get());
  });
});
