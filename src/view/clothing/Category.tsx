import { LinearProgress} from "@mui/material";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { MetaData, Product } from "../../utils/types";
import ItemBrowser from "../items/ItemBrowser";
import AddIcon from '@mui/icons-material/Add';
import { fetchCategory} from "../../network/networkConfig";
import '../../styles/clothing/ClothingMainPage.css'
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../network/redux/store/store";
import { incrPageNumber, resetPageNumber } from "../../network/redux/reducers/pageNumberSlice";
import { setCategoryName } from "../../network/redux/actions/actions";
import { setProductCount } from "../../network/redux/reducers/productCountSlice";
import { motion } from "framer-motion";
import { findSortTrue } from "../../utils/sortUtils";
import { useLocation } from "react-router-dom";


export function Category() {
    const [metaData, setMetaData] = useState<MetaData>();
    

    const [prevCategoryID, setPrevCategoryID] = useState<string | null>(null);
   
    const [products, setProducts] = useState<Product[]>([]);
   
    const categoryID = useSelector((state: RootState) => state.persistedReducer.category.categoryID);
    const page = useSelector((state: RootState) => state.pageNumber.pageNumber);
    const sortState = useSelector((state: RootState) => state.sortState);
   
    const dispatch = useDispatch();
    const location = useLocation();
    const pathname = location.pathname;
    
    const calculateProgress = () => {
        if (metaData && metaData.totalCount) {
            const totalCount = metaData.totalCount;
            const count = products.length;
            const percentage = (count / totalCount) * 100;
            return percentage;
        }
        return 0; // Default to 0 if metadata is not available
    };

    const progressPercentage = calculateProgress();

    function handleLoadingMoreProducts() {
        dispatch(incrPageNumber());
    }
    
    
    
    
  
    const noMorePages = products.length === metaData?.totalCount ? true : false;

    useEffect(()=>{
        
        async function fetchData() {
            const sorting = findSortTrue(sortState);
            try {
                
                const data = await fetchCategory(categoryID, page, 8, sorting?.option, sorting?.order);
                if (categoryID === prevCategoryID) {

                    setProducts(prevProducts => [...prevProducts, ...data.products.data]);

                } else {

                    dispatch(resetPageNumber());
                    dispatch(setProductCount(data.products.metadata.totalCount))

                    if (data.Name.toLocaleLowerCase() === 'botw') {
                        dispatch(setCategoryName('Brand of the Week'))
                    }else{
                        dispatch(setCategoryName(data.Name))
                    }
                    
                    setProducts(data.products.data);
                    setPrevCategoryID(categoryID);

                }

                setMetaData(data.products.metadata);
                

            } catch (error) {
                console.error("Error fetching data:", error);
            }
          
        }

        fetchData();
        
    },[categoryID, page,])


    useEffect(() => {
        
        async function fetchData() {
            const sorting = findSortTrue(sortState);
            
            try {
                const data = await fetchCategory(categoryID, 1, 8, sorting?.option, sorting?.order);
                console.log(data.products.data);
                setProducts(data.products.data);
                setMetaData(data.products.metadata)
                if (data.Name.toLocaleLowerCase() === 'botw') {
                    dispatch(setCategoryName('Brand of the Week'))
                }else{
                    dispatch(setCategoryName(data.Name))
                }
                dispatch(setProductCount(data.products.metadata.totalCount));
                
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
       
        fetchData();
    }, [sortState, categoryID, pathname]);
    
    
    return (
        <motion.div layout layoutRoot className="col-12 d-flex justify-content-center align-items-center flex-column">
            <ItemBrowser products={products} />
            
            <p className='mb-1 mt-5 item-count'>{products.length} out of {metaData?.totalCount}</p>
            <style>
                {`
                .progress-bar::before {
                    content: '';
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    top: 0;
                    left: calc(${progressPercentage}% - 100%);
                    background-color: var(--primary-clr);
                }
            `}
            </style>
            <LinearProgress className='products-loaded-bar col-10 col-lg-2' variant="determinate" value={progressPercentage} />
            <Button className='load-more-btn mb-3 mt-2 col-10 col-lg-2' onClick={handleLoadingMoreProducts} disabled={noMorePages}> <AddIcon fontSize='small' /></Button>

        </motion.div>
    );
}
