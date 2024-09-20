import { cn } from "@/lib/utils"
import { ReactNode } from "react"

const MaxWidthWrapper = ({
  className, //Two properties
  children, 
  /**can i use ...props instead of children?
   * 
   * since error goes away after replacing "props" to "children" ir means ReactNode include object with "children" property but not "props" property?
   * 
   * You've got it exactly right!  Here's a breakdown of the key points:

      ReactNode: 

      Represents any valid element that can be rendered in React.
      Does not include an object with a props property.
      Can contain objects with children properties.

      Children Prop:

      A special prop that components can accept.
      Used to pass content (other ReactNodes) to a component.
      Can contain any valid ReactNode type (components, strings, numbers, etc.).
   */
}: {
  className?: string
  children: ReactNode //any react element is a reactNode
}) => {
  return (
    <div
      className={cn( //Dynamic classname
        "h-full mx-auto w-full max-w-screen-xl px-2.5 md:px-20", //default classname
        className //merging default with incoming classname so we can ovveride default with something else if we want
      )}
    >
      {children}
    </div>
  )
}

// the dynamic classname with cn() function comes from utils.ts which is already created by ui library
export default MaxWidthWrapper

//now use in page.tsx or others
