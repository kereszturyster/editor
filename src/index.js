import $ from "jquery";
import {ContextRangeContainer} from "./ContextRangeContainer";

$(function(){
  const containers = new ContextRangeContainer(".container");
  containers.onCreateRange(() => {
    console.log("Containers", containers.getContainer().get());
    console.log("Context", containers.getContext().get());
    console.log("Images", containers.getImage().get());
    console.log("TextElements", containers.getTextElements().get());
  });
});
